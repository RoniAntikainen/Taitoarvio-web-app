import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";

export default async function ManageSessionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("coach");
  const { id } = await params;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h1>Session hallinta</h1>
      <p>Session ID: {id}</p>
      <p>Coach-only hallinta: sessioiden luonti ja päivitys tapahtuu kansiossa.</p>
      <Link href={`/app/folders/${id}`} className="btn btn--primary">
        Avaa harjoite-workspace
      </Link>
    </div>
  );
}
