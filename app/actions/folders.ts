// app/actions/folders.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  requireEmail,
  normalizeEmail,
  requireFolderAccess,
  getEntitlement,
} from "@/lib/access";
import { assertFolderLimit } from "@/lib/limits";
import { requireCurrentUser } from "@/lib/auth/session";
import { canManageWorkspace } from "@/lib/auth/permissions";

type MemberRole = "viewer" | "editor" | "student";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  return "Tuntematon virhe";
}

export async function createFolder(
  name: string,
  sportId: "football" | "dance" = "football",
  athleteName: string = ""
): Promise<ActionResult<{ folderId: string }>> {
  try {
    const session = await auth();
    const ownerEmail = requireEmail(session);
    const user = await requireCurrentUser();
    if (!canManageWorkspace(user)) return { ok: false, error: "Vain coach voi luoda workspaceja." };

    const ent = getEntitlement(session);
    await assertFolderLimit(ownerEmail, ent.status);

    const folder = await prisma.folder.create({
      data: { name: String(name).trim(), ownerId: ownerEmail },
    });

    await prisma.folderMember.create({
      data: { folderId: folder.id, userEmail: ownerEmail, role: "editor" },
    });

    await prisma.folderItem.create({
      data: {
        folderId: folder.id,
        type: "profile",
        title: "Profiili",
        content: JSON.stringify({ sportId, athleteName }),
        createdBy: ownerEmail,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/app/folders");
    return { ok: true, data: { folderId: folder.id } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/* muut exportit voi jäädä ennalleen (addMember, listMyFolders, jne) */
export async function listMyFolders() {
  const session = await auth();
  const me = requireEmail(session);

  return prisma.folder.findMany({
    where: { members: { some: { userEmail: me } } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      members: { select: { userEmail: true, role: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getFolderView(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);

  await requireFolderAccess(folderId, me, "viewer");

  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      members: {
        select: { userEmail: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!folder) throw new Error("Folder not found");

  const access = await requireFolderAccess(folderId, me, "viewer");
  return { folder, role: access.role };
}

export async function addMember(folderId: string, userEmail: string, role: MemberRole = "viewer") {
  const session = await auth();
  const me = requireEmail(session);
  const user = await requireCurrentUser();
  if (!canManageWorkspace(user)) throw new Error("Vain coach voi kutsua muita valmentajia.");

  const { folder, role: myRole } = await requireFolderAccess(folderId, me, "owner");
  if (myRole !== "owner") throw new Error("No access");

  const targetEmail = normalizeEmail(userEmail);
  if (!targetEmail) throw new Error("Email missing");

  await prisma.folderMember.upsert({
    where: { folderId_userEmail: { folderId, userEmail: targetEmail } },
    update: { role },
    create: { folderId, userEmail: targetEmail, role },
  });

  await prisma.notification.create({
    data: {
      userEmail: targetEmail,
      folderId,
      title: "Sinut lisättiin kansioon",
      body: `Kansio: ${folder.name}`,
      href: `/app/folders/${folderId}`,
    },
  });

  revalidatePath(`/app/folders/${folderId}`);
  revalidatePath("/app/folders");
}

export async function addMemberFromForm(folderId: string, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "viewer") as MemberRole;
  const normalizedRole: MemberRole = role === "editor" ? "editor" : role === "student" ? "student" : "viewer";
  await addMember(folderId, email, normalizedRole);
}

export async function removeMember(folderId: string, userEmail: string) {
  const session = await auth();
  const me = requireEmail(session);
  const user = await requireCurrentUser();
  if (!canManageWorkspace(user)) throw new Error("Vain coach voi hallita workspace-jäseniä.");

  const { folder, role } = await requireFolderAccess(folderId, me, "owner");
  if (role !== "owner") throw new Error("No access");

  const targetEmail = normalizeEmail(userEmail);
  if (!targetEmail) throw new Error("Email missing");
  if (targetEmail === normalizeEmail(folder.ownerId)) throw new Error("Cannot remove owner");

  await prisma.folderMember.deleteMany({
    where: { folderId, userEmail: targetEmail },
  });

  revalidatePath(`/app/folders/${folderId}`);
  revalidatePath("/app/folders");
}

export async function leaveFolder(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);

  const access = await requireFolderAccess(folderId, me, "viewer");
  if (access.role === "owner") throw new Error("Owner cannot leave folder");

  await prisma.folderMember.deleteMany({
    where: { folderId, userEmail: me },
  });

  revalidatePath("/app/folders");
  revalidatePath(`/app/folders/${folderId}`);
}
export async function listNotifications() {
  const session = await auth();
  const me = requireEmail(session);

  return prisma.notification.findMany({
    where: { userEmail: me },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  const me = requireEmail(session);

  await prisma.notification.updateMany({
    where: { id: String(id), userEmail: me },
    data: { readAt: new Date() },
  });

  revalidatePath("/app/notifications");
}
// ===== Compatibility exports (older pages) =====
export async function listFolderEvaluations(folderId: string) {
  // Vanha page odottaa tätä folders.ts:stä, mutta logiikka on folder-evaluations.ts:ssä
  const mod = await import("@/app/actions/folder-evaluations");
  return mod.listEvaluations(folderId);
}
