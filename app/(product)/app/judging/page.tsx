import Link from "next/link";
import ProFeatureGate from "@/components/ui/ProFeatureGate";
import { combinePlacements } from "@/domain/skating";
import { getRoleLabel, roleBadgeTone } from "@/features/auth/roles";
import { addMemberFromForm } from "@/app/actions/folders";
import {
  addJudgingComment,
  createJudgingEvaluation,
  listJudgingEvaluations,
  listJudgingFolders,
  submitJudgingResult,
} from "@/app/actions/judging";
import { auth } from "@/auth";
import { normalizeEmail } from "@/lib/access";
import "./judging.css";

function toJudgeResults(evaluationId: string, map: Record<string, Record<string, number>>) {
  return Object.entries(map).map(([judgeId, placements]) => ({
    evaluationId,
    judgeId,
    placements: Object.entries(placements).map(([participantId, place]) => ({ participantId, place })),
    rubricScoreByParticipant: {},
  }));
}

export default async function JudgingTrainingPage({
  searchParams,
}: {
  searchParams?: Promise<{ folderId?: string; evaluationId?: string }>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const folders = await listJudgingFolders();
  const folderId = sp?.folderId ?? folders[0]?.id;
  const evaluations = folderId ? await listJudgingEvaluations(folderId) : [];
  const evaluationId = sp?.evaluationId ?? evaluations[0]?.id;
  const active = evaluations.find((e) => e.id === evaluationId) ?? null;

  const session = await auth();
  const me = normalizeEmail(session?.user?.email ?? "");

  const myMemberRole = folderId
    ? folders.find((f) => f.id === folderId)?.members?.[0]?.role ?? "viewer"
    : "viewer";
  const appRole = myMemberRole === "student" ? "student" : "coach";
  const canCreate = appRole === "coach";

  const combined = active
    ? combinePlacements(toJudgeResults(active.id, active.payload.judgeResults))
    : [];

  return (
    <div className="judgingPage">
      <header className="judgingHeader">
        <div>
          <h1>Harjoittelu (Tuomarointi)</h1>
          <p>Toimiva virta: kansio → valmentajakutsu → kisa → arviointi → yhteistulos → kommentointi.</p>
        </div>
        <span className={roleBadgeTone(appRole)}>{getRoleLabel(appRole)}</span>
      </header>

      <section className="stepper" aria-label="Arvioinnin vaiheet">
        <span>1. Setup</span>
        <span>2. Arviointi</span>
        <span>3. Tulokset</span>
      </section>

      <section className="cardGrid">
        <article className="card">
          <h2>Setup</h2>
          <label htmlFor="folderSel">Kansio</label>
          <select id="folderSel" defaultValue={folderId ?? ""} disabled>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
          <div className="inlineLinks">
            {folders.map((folder) => (
              <Link key={folder.id} href={`/app/judging?folderId=${folder.id}`}>
                {folder.name}
              </Link>
            ))}
          </div>

          {folderId && canCreate ? (
            <form className="stack" action={createJudgingEvaluation}>
              <input type="hidden" name="folderId" value={folderId} />
              <input name="subject" placeholder="Kisan nimi" required />
              <select name="mode" defaultValue="deep">
                <option value="light">Kevyt katsastelu</option>
                <option value="deep">Syvä katsastelu</option>
              </select>
              <textarea
                name="participants"
                rows={4}
                placeholder="Yksi kilpailija per rivi, esim.&#10;Pari A&#10;Pari B"
                required
              />
              <button type="submit">Luo kisa</button>
            </form>
          ) : (
            <ProFeatureGate allowed={canCreate} label="Luo uusi kilpailu" />
          )}

          {folderId && canCreate ? (
            <form className="stack" action={addMemberFromForm.bind(null, folderId)}>
              <input name="email" type="email" placeholder="co-coach sähköposti" required />
              <select name="role" defaultValue="editor">
                <option value="editor">Coach (editor)</option>
                <option value="viewer">Viewer</option>
                <option value="student">Oppilas</option>
              </select>
              <button type="submit">Kutsu jäsen</button>
            </form>
          ) : null}
        </article>

        <article className="card">
          <h2>Arviointi</h2>
          {!active ? (
            <p>Valitse tai luo kisa setup-vaiheessa.</p>
          ) : (
            <>
              <p>
                Kisa: <strong>{active.subject}</strong>
              </p>
              <p>Moodi: {active.payload.mode === "deep" ? "Syvä" : "Kevyt"}</p>
              <div className="inlineLinks">
                {evaluations.map((ev) => (
                  <Link key={ev.id} href={`/app/judging?folderId=${folderId}&evaluationId=${ev.id}`}>
                    {ev.subject}
                  </Link>
                ))}
              </div>

              {canCreate ? (
                <form className="stack" action={submitJudgingResult}>
                  <input type="hidden" name="evaluationId" value={active.id} />
                  {active.payload.participants.map((p, index) => (
                    <label key={p}>
                      {p}
                      <input
                        name={`place:${p}`}
                        type="number"
                        min={1}
                        max={active.payload.participants.length}
                        defaultValue={active.payload.judgeResults?.[me]?.[p] ?? index + 1}
                        required
                      />
                    </label>
                  ))}
                  <button type="submit">Tallenna oma sijoitus</button>
                </form>
              ) : (
                <ProFeatureGate allowed={false} label="Arvioinnin tallennus (vain valmentaja)" />
              )}
            </>
          )}
        </article>
      </section>

      {active ? (
        <section className="card">
          <h2>Tulokset (yhteistulos)</h2>
          <table>
            <thead>
              <tr>
                <th>Kilpailija</th>
                <th>1. sijan äänet</th>
                <th>Keskiarvosija</th>
                <th>Lopullinen sijoitus</th>
              </tr>
            </thead>
            <tbody>
              {combined.map((row) => (
                <tr key={row.participantId} className={row.finalPlace <= 3 ? "top3" : ""}>
                  <td>{row.participantId}</td>
                  <td>{row.firstPlaceVotes}</td>
                  <td>{row.averagePlace.toFixed(2)}</td>
                  <td>{row.finalPlace}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Tuomareiden sijoitukset</h3>
          <table>
            <thead>
              <tr>
                <th>Tuomari</th>
                {active.payload.participants.map((p) => (
                  <th key={p}>{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(active.payload.judgeResults).map(([judge, places]) => (
                <tr key={judge}>
                  <td>{judge}</td>
                  {active.payload.participants.map((p) => (
                    <td key={p}>{places[p] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Kommentit</h3>
          <form className="commentForm" action={addJudgingComment}>
            <input type="hidden" name="evaluationId" value={active.id} />
            <textarea name="body" rows={3} placeholder="Kirjoita kommentti oppilaalle tai valmennustiimille" required />
            <button type="submit">Lisää kommentti</button>
          </form>
          <div className="commentList">
            {active.payload.comments.map((comment, index) => (
              <article key={`${comment.createdAt}-${index}`}>
                <strong>{comment.author}</strong>
                <p>{comment.body}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
