// components/shell/AppShell.tsx
import AppNav from "@/components/nav/AppNav";
import UserSheet from "@/components/user/UserMenu";
import { safeAuth } from "@/lib/auth/safeAuth";

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await safeAuth();
  const me = session?.user ?? null;

  return (
    <div className="appShell">
      <header className="appTopbar" aria-label="Tablet top bar">
        <div className="appTopbar__inner">
          <div className="appTopbar__brand">
            <span className="appBrand__text">Taitoarvio</span>
          </div>

          <div className="appTopbar__nav">
            <AppNav mode="tablet" />
          </div>

          <div className="appTopbar__user">{me ? <UserSheet user={me} /> : null}</div>
        </div>
      </header>

      <aside className="appSidebar" aria-label="Sidebar navigation">
        <div className="appSidebar__inner">
          <div className="appSidebar__brand">
            <span className="appBrand__text">Taitoarvio</span>
          </div>

          <nav className="appSidebar__nav" aria-label="Primary navigation">
            <AppNav mode="desktop" />
          </nav>

          <div className="appSidebar__profile" aria-label="Account">
            <div className="appSidebar__profileAvatar">{me ? <UserSheet user={me} /> : null}</div>
            <div className="appSidebar__profileMeta">
              <div className="appSidebar__profileName">{me?.name ?? "Käyttäjä"}</div>
              <div className="appSidebar__profileSub">{me?.email ?? ""}</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="appMain">
        <div className="appMain__inner">{children}</div>
      </main>

      <nav className="appTabbar" aria-label="Primary navigation">
        <div className="appTabbar__inner">
          <div className="appTabbar__nav">
            <AppNav mode="mobile" />
          </div>
          <div className="appTabbar__user">{me ? <UserSheet user={me} /> : null}</div>
        </div>
      </nav>
    </div>
  );
}
