import { listMyFolders } from "@/app/actions/folders";
import { requireRole } from "@/lib/auth/guards";
import SessionsPageClient from "./SessionsPageClient";

export default async function SessionsPage() {
  await requireRole("coach");
  const folders = await listMyFolders();
  return <SessionsPageClient folders={folders.map((f) => ({ id: f.id, name: f.name }))} />;
}
