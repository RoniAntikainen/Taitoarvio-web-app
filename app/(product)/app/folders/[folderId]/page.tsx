import Link from "next/link";
import {
  getFolderView,
  leaveFolder,
  listFolderEvaluations,
} from "@/app/actions/folders";
import {
  getFolderProfile,
  getSection,
  saveResultsJsonFromForm,
  saveSectionFromForm,
  saveUpcomingJsonFromForm,
} from "@/app/actions/folder-sections";
import { createFolderEvaluationFromForm } from "@/app/actions/folder-evaluations";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageWorkspace } from "@/lib/auth/permissions";
import ResultsEditor from "@/components/folders/ResultsEditor";
import UpcomingPicker from "@/components/folders/UpcomingPicker";
import FolderAnalyticsCards from "@/components/folders/FolderAnalyticsCards";
import { createFolderCommentFromForm, listFolderComments } from "@/app/actions/folder-items";

// ✅ lisätty (älä muuta nimeä)
import MeetingsSection from "../[id]/MeetingsSection";

import "./folder.css";

function sportName(sportId: string) {
  if (sportId === "dance") return "Tanssi";
  return "Jalkapallo";
}

function areasForSport(sportId: string) {
  if (sportId === "dance")
    return ["Tekniikka", "Rytmi", "Esiintyminen", "Pari-/ryhmätyö", "Kestävyys"];
  return [
    "Joukkuepelaaminen",
    "Tekniikka",
    "Peliasenne",
    "Taktinen ymmärrys",
    "Fyysisyys",
  ];
}

export default async function FolderDetailPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;

  const { folder, role } = await getFolderView(folderId);
  const profile = await getFolderProfile(folderId);
  const sportId = profile.sportId;

  const plan = await getSection(folderId, "plan");
  const upcoming = await getSection(folderId, "upcoming");
  const results = await getSection(folderId, "results");

  const evaluations = await listFolderEvaluations(folderId);
  const comments = await listFolderComments(folderId);
  const user = await getCurrentUser();
  const canEdit = (role === "owner" || role === "editor") && canManageWorkspace(user);
  const canEvaluate = role !== "viewer";

  return (
    <div className="fd-page">
      {/* HEADER */}
      <header className="fd-header">
        <div className="fd-head">
          <div className="fd-headTitle">
            <h1 className="fd-title">{folder.name}</h1>
            <div className="fd-meta">
              <span>Oppilas: {profile.athleteName || "—"}</span>
              <span className="fd-dot">·</span>
              <span>Laji: {sportName(sportId)}</span>
              <span className="fd-dot">·</span>
              <span>Rooli: {role}</span>
            </div>
          </div>

          <div className="fd-headRight">
            <div className="fd-actions">
              <Link className="btn btn--secondary" href="/app/folders">
                Takaisin
              </Link>
              {canEdit && (
                <Link
                  className="btn btn--secondary"
                  href={`/app/folders/${folderId}/settings`}
                >
                  Asetukset
                </Link>
              )}
            </div>

            {role !== "owner" && (
              <form
                className="fd-inline"
                action={leaveFolder.bind(null, folderId)}
              >
                <button type="submit" className="btn btn--danger">
                  Poistu kansiosta
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* QUICK ACTIONS */}
      <section className="fd-toolbar" aria-label="Pikatoiminnot">
        <button className="btn btn--ghost" disabled>
          + Uusi muistiinpano
        </button>
        <button className="btn btn--ghost" disabled>
          + Lisää tulos
        </button>
        <button className="btn btn--ghost" disabled>
          + Tee arviointi
        </button>
        <button className="btn btn--ghost" disabled>
          Jaa
        </button>
        <div className="fd-toolbarHint">
          {canEdit
            ? "Voit muokata tämän kansion tietoja."
            : role === "student"
              ? "Oppilasrooli: voit arvioida ja kommentoida."
              : "Sinulla on vain lukuoikeus."}
        </div>
      </section>

      {/* PLAN */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Valmennussuunnitelma</h2>
          <div className="fd-sectionRight">
            <span className="fd-subtle">Vapaamuotoinen suunnitelma</span>
          </div>
        </div>

        <form action={saveSectionFromForm} className="fd-form">
          <input type="hidden" name="folderId" value={folderId} />
          <input type="hidden" name="key" value="plan" />

          <textarea
            name="json"
            rows={10}
            defaultValue={plan.content || ""}
            placeholder="Kirjoita valmennussuunnitelma tähän..."
            className="input"
            disabled={!canEdit}
          />

          <div className="fd-formActions">
            {canEdit && <button className="btn btn--primary">Tallenna</button>}
          </div>
        </form>
      </section>

      {/* UPCOMING */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Tulevat kilpailut / pelit</h2>
          <div className="fd-sectionRight">
            <span className="fd-subtle">Valitse tapahtumat listasta</span>
          </div>
        </div>

        <form
          action={saveUpcomingJsonFromForm.bind(null, folderId)}
          className="fd-form"
        >
          <UpcomingPicker
            sportId={sportId}
            initialJson={upcoming.content || ""}
            readOnly={!canEdit}
          />

          <div className="fd-formActions">
            {canEdit && (
              <button className="btn btn--primary">Tallenna tulevat</button>
            )}
          </div>
        </form>
      </section>

      {/* RESULTS */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Tulokset</h2>
          <div className="fd-sectionRight">
            <span className="fd-subtle">Lisää rivejä ja tallenna</span>
          </div>
        </div>

        <form
          action={saveResultsJsonFromForm.bind(null, folderId)}
          className="fd-form"
        >
          <ResultsEditor
            sportId={sportId as any}
            initialJson={results.content || "[]"}
            readOnly={!canEdit}
          />
          <div className="fd-formActions">
            {canEdit && (
              <button className="btn btn--primary">Tallenna tulokset</button>
            )}
          </div>
        </form>
      </section>

      {/* EVALUATION */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Oppilaan arviointi</h2>
          <div className="fd-sectionRight">
            <span className="fd-subtle">1-5, “—” = arvioimaton</span>
          </div>
        </div>

        {canEvaluate ? (
          <form
            action={createFolderEvaluationFromForm}
            className="fd-card fd-form"
          >
            {/* ✅ FIX: folderId tulee formDatassa eikä bindillä */}
            <input type="hidden" name="folderId" value={folderId} />

            <div className="fd-row">
              <input
                name="subject"
                defaultValue={profile.athleteName || "Oppilas"}
                placeholder="Oppilaan nimi"
                className="input"
              />
              <input
                name="evaluator"
                placeholder="Arvioija (valinnainen)"
                className="input"
              />
              <input type="hidden" name="sportId" value={sportId} />
            </div>

            <div className="fd-areas">
              {areasForSport(sportId).map((a) => (
                <div key={a} className="fd-area">
                  <div className="fd-area-label">{a}</div>
                  <select
                    name={`score:${a}`}
                    defaultValue="unrated"
                    className="input"
                  >
                    <option value="unrated">—</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              ))}
            </div>

            <textarea
              name="notes"
              rows={4}
              placeholder="Lisähuomiot"
              className="input"
            />
            <div className="fd-formActions">
              <button className="btn btn--primary">Tallenna arviointi</button>
            </div>
          </form>
        ) : (
          <div className="fd-muted">Sinulla on vain lukuoikeus.</div>
        )}

        <div className="fd-divider" />

        {evaluations.length === 0 ? (
          <div className="fd-muted">Ei arviointeja vielä.</div>
        ) : (
          <div className="fd-list">
            {evaluations.map((e: any) => (
              <article key={e.id} className="fd-card fd-item">
                <div className="fd-itemHead">
                  <div className="fd-itemTitle">
                    <div className="fd-strong">{e.subject}</div>
                    <div className="fd-muted">
                      {new Date(e.createdAt).toLocaleString("fi-FI")}
                    </div>
                  </div>
                  <div className="fd-muted">
                    {e.sportLabel}
                    {e.evaluator ? ` · ${e.evaluator}` : ""}
                  </div>
                </div>

                {e.data?.scores && (
                  <div className="fd-scores">
                    {Object.entries(e.data.scores).map(([k, v]) => (
                      <div key={k} className="fd-score">
                        <div className="fd-scoreKey">{k}</div>
                        <div className="fd-scoreVal">{String(v)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {e.data?.notes && <div className="fd-pre">{e.data.notes}</div>}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* COMMENTS */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Keskustelu</h2>
          <div className="fd-sectionRight">
            <span className="fd-subtle">Kommentoi ryhmän sisältöä ja seuraa päivityksiä</span>
          </div>
        </div>

        <form action={createFolderCommentFromForm.bind(null, folderId)} className="fd-form">
          <textarea
            name="comment"
            rows={3}
            className="input"
            placeholder="Kirjoita kommentti kansioon..."
          />
          <div className="fd-formActions">
            <button className="btn btn--primary" type="submit">Lähetä kommentti</button>
          </div>
        </form>

        <div className="fd-divider" />

        {comments.length === 0 ? (
          <div className="fd-muted">Ei kommentteja vielä.</div>
        ) : (
          <div className="fd-list">
            {comments.map((c) => (
              <article key={c.id} className="fd-card fd-item">
                <div className="fd-itemHead">
                  <div className="fd-itemTitle">
                    <div className="fd-strong">{c.createdBy || "Tuntematon"}</div>
                    <div className="fd-muted">
                      {new Date(c.createdAt).toLocaleString("fi-FI")}
                    </div>
                  </div>
                </div>
                <div className="fd-pre">{c.content}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MEETINGS */}
      <section className="fd-section">
        <div className="fd-sectionHead">
          <h2 className="fd-sectionTitle">Tapaamiset</h2>
          <div className="fd-sectionRight">
            <Link className="btn btn--secondary" href="/app/calendar">
              Avaa kalenteri
            </Link>
          </div>
        </div>

        <MeetingsSection folderId={folderId} role={role} userRole={user?.role ?? "student"} />
      </section>
    </div>
  );
}
