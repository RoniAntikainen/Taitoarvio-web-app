"use client";

import Link from "next/link";
import RequireRole from "@/components/auth/RequireRole";

export default function SessionsPageClient({ folders }: { folders: Array<{ id: string; name: string }> }) {
  return (
    <RequireRole role="coach" fallback={<p>Ei oikeuksia sessiohallintaan.</p>}>
      <div style={{ display: "grid", gap: 12 }}>
        <h1>Sessiot</h1>
        <p>Coach voi luoda ja hallita sessioita.</p>
        {folders.map((f) => (
          <Link key={f.id} href={`/app/sessions/${f.id}/manage`} className="btn btn--secondary">
            Hallinnoi: {f.name}
          </Link>
        ))}
      </div>
    </RequireRole>
  );
}
