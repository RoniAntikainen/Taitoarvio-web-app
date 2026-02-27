import type { Role } from "@/lib/auth/domain";
import { redirect } from "next/navigation";
import {
  createFolderMeeting,
  deleteMeeting,
  listFolderMeetings,
  updateMeeting,
} from "@/app/actions/meetings";

function toDTLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default async function MeetingsSection({
  folderId,
  role,
  userRole,
}: {
  folderId: string;
  role: "owner" | "editor" | "viewer" | "student";
  userRole: Role;
}) {
  const meetings = await listFolderMeetings(folderId);
  const canEdit = (role === "owner" || role === "editor") && userRole === "coach";

  return (
    <div className="fd-stack">
      {canEdit ? (
        <form
          className="fd-form"
          action={async (formData: FormData) => {
            "use server";
            const title = String(formData.get("title") ?? "").trim();
            const startsAt = String(formData.get("startsAt") ?? "").trim();
            const endsAt = String(formData.get("endsAt") ?? "").trim();
            const location = String(formData.get("location") ?? "").trim();
            const agenda = String(formData.get("agenda") ?? "").trim();
            const notes = String(formData.get("notes") ?? "").trim();

            const res = await createFolderMeeting(folderId, {
              title,
              startsAt,
              endsAt: endsAt || undefined,
              location,
              agenda,
              notes,
            });

            if (!res.ok) {
              redirect(
                `/app/folders/${folderId}?error=${encodeURIComponent(res.error)}`
              );
            }

            redirect(`/app/folders/${folderId}`);
          }}
        >
          <div className="fd-formRow">
            <div className="fd-formCol">
              <label className="fd-label">Otsikko</label>
              <input
                name="title"
                className="fd-input"
                placeholder="Esim. Treenit / Valmennus / Palaveri"
                required
              />
            </div>
          </div>

          <div className="fd-formRow">
            <div className="fd-formCol">
              <label className="fd-label">Alkaa</label>
              <input name="startsAt" className="fd-input" type="datetime-local" required />
            </div>

            <div className="fd-formCol">
              <label className="fd-label">Päättyy (valinnainen)</label>
              <input name="endsAt" className="fd-input" type="datetime-local" />
            </div>
          </div>

          <div className="fd-formRow">
            <div className="fd-formCol">
              <label className="fd-label">Paikka (valinnainen)</label>
              <input
                name="location"
                className="fd-input"
                placeholder="Esim. sali / Teams / kenttä"
              />
            </div>
          </div>

          <div className="fd-formRow">
            <div className="fd-formCol">
              <label className="fd-label">Mitä käydään läpi</label>
              <textarea
                name="agenda"
                className="fd-input"
                rows={3}
                placeholder="- Lämmittely&#10;- Tekniikka&#10;- Tavoitteet"
              />
            </div>
          </div>

          <div className="fd-formRow">
            <div className="fd-formCol">
              <label className="fd-label">Muistiinpanot</label>
              <textarea
                name="notes"
                className="fd-input"
                rows={4}
                placeholder="Kirjaa tärkeimmät jutut, fiilikset ja jatkotoimet…"
              />
            </div>
          </div>

          <div className="fd-formRow">
            <button className="fd-btn" type="submit">
              Lisää tapaaminen
            </button>
          </div>
        </form>
      ) : null}

      {meetings.length === 0 ? (
        <div className="fd-empty">Ei tapaamisia vielä.</div>
      ) : (
        <div className="fd-list">
          {meetings.map((m) => (
            <article key={m.id} className="fd-card fd-item">
              <div className="fd-itemHead">
                <div className="fd-itemTitle">
                  <div className="fd-strong">{m.title}</div>
                  <div className="fd-muted">
                    {new Date(m.startsAt).toLocaleString("fi-FI")}
                    {m.endsAt
                      ? ` – ${new Date(m.endsAt).toLocaleTimeString("fi-FI", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                    {m.location ? ` · ${m.location}` : ""}
                  </div>
                </div>
              </div>

              <div className="fd-pre">{m.agenda || "—"}</div>
              <div className="fd-pre">{m.notes || "—"}</div>

              {canEdit ? (
                <div className="fd-row fd-row--gap">
                  {/* UPDATE */}
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      const title = String(formData.get("title") ?? "").trim();
                      const startsAt = String(formData.get("startsAt") ?? "").trim();
                      const endsAt = String(formData.get("endsAt") ?? "").trim();
                      const location = String(formData.get("location") ?? "").trim();
                      const agenda = String(formData.get("agenda") ?? "").trim();
                      const notes = String(formData.get("notes") ?? "").trim();

                      const res = await updateMeeting(m.id, {
                        title,
                        startsAt,
                        endsAt,
                        location,
                        agenda,
                        notes,
                      });

                      if (!res.ok) {
                        redirect(
                          `/app/folders/${folderId}?error=${encodeURIComponent(res.error)}`
                        );
                      }
                      redirect(`/app/folders/${folderId}`);
                    }}
                    className="fd-form"
                  >
                    <div className="fd-formRow">
                      <div className="fd-formCol">
                        <label className="fd-label">Otsikko</label>
                        <input
                          name="title"
                          className="fd-input"
                          defaultValue={m.title}
                          required
                        />
                      </div>
                    </div>

                    <div className="fd-formRow">
                      <div className="fd-formCol">
                        <label className="fd-label">Alkaa</label>
                        <input
                          name="startsAt"
                          className="fd-input"
                          type="datetime-local"
                          defaultValue={toDTLocalValue(new Date(m.startsAt))}
                          required
                        />
                      </div>

                      <div className="fd-formCol">
                        <label className="fd-label">Päättyy</label>
                        <input
                          name="endsAt"
                          className="fd-input"
                          type="datetime-local"
                          defaultValue={
                            m.endsAt ? toDTLocalValue(new Date(m.endsAt)) : ""
                          }
                        />
                      </div>
                    </div>

                    <div className="fd-formRow">
                      <div className="fd-formCol">
                        <label className="fd-label">Paikka</label>
                        <input
                          name="location"
                          className="fd-input"
                          defaultValue={m.location ?? ""}
                        />
                      </div>
                    </div>

                    <div className="fd-formRow">
                      <div className="fd-formCol">
                        <label className="fd-label">Agenda</label>
                        <textarea
                          name="agenda"
                          className="fd-input"
                          rows={3}
                          defaultValue={m.agenda ?? ""}
                        />
                      </div>
                    </div>

                    <div className="fd-formRow">
                      <div className="fd-formCol">
                        <label className="fd-label">Muistiinpanot</label>
                        <textarea
                          name="notes"
                          className="fd-input"
                          rows={4}
                          defaultValue={m.notes ?? ""}
                        />
                      </div>
                    </div>

                    <div className="fd-formRow">
                      <button className="fd-btn" type="submit">
                        Tallenna
                      </button>
                    </div>
                  </form>

                  {/* DELETE (oma form, ei sisäkkäinen) */}
                  <form
                    action={async () => {
                      "use server";
                      const res = await deleteMeeting(m.id);
                      if (!res.ok) {
                        redirect(
                          `/app/folders/${folderId}?error=${encodeURIComponent(res.error)}`
                        );
                      }
                      redirect(`/app/folders/${folderId}`);
                    }}
                  >
                    <button className="fd-btn fd-btn--ghost" type="submit">
                      Poista
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
