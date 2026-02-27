import Link from "next/link";
import { addMemberFromForm, getFolderView, removeMember } from "@/app/actions/folders";
import {
  getFolderProfile,
  saveFolderProfileFromForm,
} from "@/app/actions/folder-sections";
import "./folder-settings.css";
import { getCurrentUser } from "@/lib/auth/session";
import { canManageWorkspace } from "@/lib/auth/permissions";

function roleLabel(role: string) {
  if (role === "owner") return "Omistaja";
  if (role === "editor") return "Valmentaja";
  if (role === "student") return "Oppilas";
  return "Katsoja";
}

export default async function FolderSettingsPage({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const { folder, role } = await getFolderView(folderId);
  const profile = await getFolderProfile(folderId);
  const user = await getCurrentUser();

  const canEdit = role !== "viewer" && role !== "student" && canManageWorkspace(user);
  const canManageMembers = role === "owner" && canManageWorkspace(user);

  return (
    <div className="fs-page">
      <div className="fs-header">
        <div>
          <h1 className="fs-title">Kansion asetukset</h1>
          <div className="fs-meta">{folder.name}</div>
        </div>

        <div className="fs-actions">
          <Link href={`/app/folders/${folderId}`}>Takaisin kansioon</Link>
          <Link href="/app/folders">Kaikki kansiot</Link>
        </div>
      </div>

      <section className="fs-card">
        <h2>Profiili</h2>

        <form
          action={saveFolderProfileFromForm.bind(null, folderId)}
          className="fs-form"
        >
          <div className="fs-field">
            <label className="fs-label">Oppilaan nimi</label>
            <input
              name="athleteName"
              defaultValue={profile.athleteName}
              disabled={!canEdit}
              className="input"
            />
          </div>

          <div className="fs-field">
            <label className="fs-label">
              Laji (vaihdettavissa vain asetuksissa)
            </label>
            <select
              name="sportId"
              defaultValue={profile.sportId}
              disabled={!canEdit}
              className="input"
            >
              <option value="football">Jalkapallo</option>
              <option value="dance">Tanssi</option>
            </select>
          </div>

          {canEdit ? (
            <button type="submit" className="btn">
              Tallenna
            </button>
          ) : (
            <div className="fs-muted">Sinulla on vain lukuoikeus.</div>
          )}
        </form>
      </section>

      <section className="fs-card">
        <h2>Ryhmäjäsenet</h2>
        <p className="fs-help">
          Lisää valmentajia, katsojia ja oppilaita tähän kansioon. Oppilas-roolilla käyttäjä näkee sisällöt ja voi kommentoida.
        </p>

        <div className="fs-members">
          {folder.members.map((member) => (
            <article key={member.userEmail} className="fs-memberRow">
              <div>
                <div className="fs-memberEmail">{member.userEmail}</div>
                <div className="fs-memberRole">{roleLabel(member.role)}</div>
              </div>

              {canManageMembers && member.role !== "owner" ? (
                <form action={removeMember.bind(null, folderId, member.userEmail)}>
                  <button className="fs-removeBtn" type="submit">Poista</button>
                </form>
              ) : null}
            </article>
          ))}
        </div>

        {canManageMembers ? (
          <form className="fs-form" action={addMemberFromForm.bind(null, folderId)}>
            <div className="fs-field">
              <label className="fs-label">Sähköposti</label>
              <input name="email" className="input" placeholder="nimi@esimerkki.fi" required />
            </div>

            <div className="fs-field">
              <label className="fs-label">Rooli</label>
              <select name="role" className="input" defaultValue="viewer">
                <option value="editor">Valmentaja (muokkaus)</option>
                <option value="viewer">Katsoja (vain luku)</option>
                <option value="student">Oppilas (luku + kommentointi)</option>
              </select>
            </div>

            <button type="submit" className="btn">Lisää jäsen</button>
          </form>
        ) : (
          <div className="fs-muted">Vain omistaja voi hallita jäseniä.</div>
        )}
      </section>
    </div>
  );
}
