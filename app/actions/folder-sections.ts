"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEmail, requireFolderAccess } from "@/lib/access";
import { requireCoachUser } from "@/lib/auth/session";

/**
 * NOTE:
 * Tässä projektissa osa sivuista käyttää:
 *   action={fn}  -> fn(formData)
 * ja osa käyttää:
 *   action={fn.bind(null, folderId)} tai fn.bind(null, folderId, key)
 *
 * -> Siksi actionit on ylikuormitettu (overload), jotta TS + Next Server Actions toimii.
 */

type SectionContent = { itemIds: string[] };

function parseContent(s: string | null | undefined): SectionContent {
  try {
    const j = JSON.parse(s || "{}");
    return { itemIds: Array.isArray(j.itemIds) ? j.itemIds.map(String) : [] };
  } catch {
    return { itemIds: [] };
  }
}

function stringifyContent(v: SectionContent) {
  return JSON.stringify({ itemIds: v.itemIds });
}

function safeJsonStringFromForm(formData: FormData, field: string) {
  const raw = String(formData.get(field) ?? "").trim();
  if (!raw) return "{}";
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    return JSON.stringify({ text: raw });
  }
}

// =========================================================
// Section itemIds - “uudempi” osiojärjestelmä (type="section")
// =========================================================

export async function listSections(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);
  const fid = String(folderId);
  await requireFolderAccess(fid, me, "viewer");

  const sections = await prisma.folderItem.findMany({
    where: { folderId: fid, type: "section" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      folderId: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const allIds = new Set<string>();
  for (const s of sections) {
    const { itemIds } = parseContent(s.content);
    itemIds.forEach((id) => allIds.add(id));
  }

  const items = allIds.size
    ? await prisma.folderItem.findMany({
        where: { id: { in: Array.from(allIds) } },
        select: {
          id: true,
          folderId: true,
          type: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    : [];

  const itemMap = new Map(items.map((i) => [i.id, i] as const));

  return sections.map((s) => {
    const { itemIds } = parseContent(s.content);
    return {
      id: s.id,
      folderId: s.folderId,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      itemIds,
      items: itemIds.map((id) => itemMap.get(id)).filter(Boolean),
    };
  });
}

export async function createSection(folderId: string, title: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const fid = String(folderId);
  await requireFolderAccess(fid, me, "editor");

  const created = await prisma.folderItem.create({
    data: {
      folderId: fid,
      type: "section",
      title: String(title).trim() || "Uusi osio",
      content: stringifyContent({ itemIds: [] }),
      createdBy: me,
      updatedAt: new Date(),
    },
    select: { id: true },
  });

  revalidatePath(`/app/folders/${fid}`);
  return created.id;
}

export async function renameSection(sectionItemId: string, title: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const s = await prisma.folderItem.findUnique({
    where: { id: String(sectionItemId) },
    select: { id: true, folderId: true, type: true },
  });
  if (!s || s.type !== "section") throw new Error("Section not found");

  await requireFolderAccess(s.folderId, me, "editor");

  await prisma.folderItem.update({
    where: { id: s.id },
    data: { title: String(title).trim() || "Osio", updatedAt: new Date() },
  });

  revalidatePath(`/app/folders/${s.folderId}`);
  return { ok: true };
}

export async function deleteSection(sectionItemId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const s = await prisma.folderItem.findUnique({
    where: { id: String(sectionItemId) },
    select: { id: true, folderId: true, type: true },
  });
  if (!s || s.type !== "section") return { ok: true };

  await requireFolderAccess(s.folderId, me, "editor");

  await prisma.folderItem.delete({ where: { id: s.id } });

  revalidatePath(`/app/folders/${s.folderId}`);
  return { ok: true };
}

export async function attachItemToSection(sectionItemId: string, folderItemId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const s = await prisma.folderItem.findUnique({
    where: { id: String(sectionItemId) },
    select: { id: true, folderId: true, type: true, content: true },
  });
  if (!s || s.type !== "section") throw new Error("Section not found");

  await requireFolderAccess(s.folderId, me, "editor");

  const item = await prisma.folderItem.findUnique({
    where: { id: String(folderItemId) },
    select: { id: true, folderId: true },
  });
  if (!item || item.folderId !== s.folderId) throw new Error("Invalid item");

  const c = parseContent(s.content);
  const id = String(folderItemId);
  if (!c.itemIds.includes(id)) c.itemIds.push(id);

  await prisma.folderItem.update({
    where: { id: s.id },
    data: { content: stringifyContent(c), updatedAt: new Date() },
  });

  revalidatePath(`/app/folders/${s.folderId}`);
  return { ok: true };
}

export async function detachItemFromSection(sectionItemId: string, folderItemId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const s = await prisma.folderItem.findUnique({
    where: { id: String(sectionItemId) },
    select: { id: true, folderId: true, type: true, content: true },
  });
  if (!s || s.type !== "section") return { ok: true };

  await requireFolderAccess(s.folderId, me, "editor");

  const c = parseContent(s.content);
  const id = String(folderItemId);
  c.itemIds = c.itemIds.filter((x) => x !== id);

  await prisma.folderItem.update({
    where: { id: s.id },
    data: { content: stringifyContent(c), updatedAt: new Date() },
  });

  revalidatePath(`/app/folders/${s.folderId}`);
  return { ok: true };
}

export async function reorderSectionItems(sectionItemId: string, orderedFolderItemIds: string[]) {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const s = await prisma.folderItem.findUnique({
    where: { id: String(sectionItemId) },
    select: { id: true, folderId: true, type: true, content: true },
  });
  if (!s || s.type !== "section") throw new Error("Section not found");

  await requireFolderAccess(s.folderId, me, "editor");

  const c = parseContent(s.content);
  const set = new Set(c.itemIds);
  const cleaned = orderedFolderItemIds.map(String).filter((id) => set.has(id));

  await prisma.folderItem.update({
    where: { id: s.id },
    data: { content: stringifyContent({ itemIds: cleaned }), updatedAt: new Date() },
  });

  revalidatePath(`/app/folders/${s.folderId}`);
  return { ok: true };
}

// =========================================================
// Compatibility exports (older pages)
// - getSection/saveSectionFromForm -> type="section_json" title=key
// - profile -> type="profile"
// =========================================================

type Profile = {
  athleteName: string;
  sportId: "football" | "dance";
};

function safeParseProfileJson(raw: string | null | undefined): Partial<Profile> {
  const s = String(raw ?? "").trim();
  if (!s) return {};
  try {
    return (JSON.parse(s) ?? {}) as Partial<Profile>;
  } catch {
    return {};
  }
}

export async function getFolderProfile(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireFolderAccess(folderId, me, "viewer");

  const fid = String(folderId);

  const folder = await prisma.folder.findUnique({
    where: { id: fid },
    select: { id: true, name: true, ownerId: true, createdAt: true, updatedAt: true },
  });

  if (!folder) throw new Error("Folder not found");

  const profileItem = await prisma.folderItem.findFirst({
    where: { folderId: fid, type: "profile" },
    orderBy: { createdAt: "asc" },
    select: { content: true },
  });

  const p = safeParseProfileJson(profileItem?.content);
  const sportId = p.sportId === "dance" ? "dance" : "football";
  const athleteName = typeof p.athleteName === "string" ? p.athleteName : "";

  return { ...folder, sportId, athleteName };
}

export async function getSection(folderId: string, key: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireFolderAccess(folderId, me, "viewer");

  const fid = String(folderId);
  const k = String(key).trim();

  const item = await prisma.folderItem.findFirst({
    where: { folderId: fid, type: "section_json", title: k },
    select: { id: true, folderId: true, title: true, content: true, createdAt: true, updatedAt: true },
  });

  return (
    item ?? {
      id: null,
      folderId: fid,
      title: k,
      content: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
}

/**
 * ✅ Tämä on se tärkeä:
 * - saveSectionFromForm(formData)
 * - saveSectionFromForm(folderId, key, formData)  <-- jotta bind(null, folderId, "plan") olisi mahdollinen
 *
 * Mutta me korjataan sivu käyttämään action={saveSectionFromForm} + hidden folderId/key,
 * jolloin bind-ongelmat poistuu pysyvästi.
 */
export async function saveSectionFromForm(formData: FormData): Promise<void>;
export async function saveSectionFromForm(folderId: string, key: string, formData: FormData): Promise<void>;
export async function saveSectionFromForm(a: any, b?: any, c?: any): Promise<void> {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  // case 1: saveSectionFromForm(formData)
  if (a instanceof FormData) {
    const formData = a;
    const folderId = String(formData.get("folderId") ?? "").trim();
    const key = String(formData.get("key") ?? "").trim();
    const content = String(formData.get("json") ?? formData.get("content") ?? "").toString();

    if (!folderId || !key) throw new Error("folderId/key missing");
    await requireFolderAccess(folderId, me, "editor");

    const existing = await prisma.folderItem.findFirst({
      where: { folderId, type: "section_json", title: key },
      select: { id: true },
    });

    if (existing) {
      await prisma.folderItem.update({
        where: { id: existing.id },
        data: { content, updatedAt: new Date(), createdBy: me },
      });
    } else {
      await prisma.folderItem.create({
        data: {
          folderId,
          type: "section_json",
          title: key,
          content,
          createdBy: me,
          updatedAt: new Date(),
        },
        select: { id: true },
      });
    }

    revalidatePath(`/app/folders/${folderId}`);
    return;
  }

  // case 2: saveSectionFromForm(folderId, key, formData)
  const folderId = String(a ?? "").trim();
  const key = String(b ?? "").trim();
  const formData = c as FormData;

  if (!folderId || !key) throw new Error("folderId/key missing");
  await requireFolderAccess(folderId, me, "editor");

  const content = String(formData.get("content") ?? "").toString();

  const existing = await prisma.folderItem.findFirst({
    where: { folderId, type: "section_json", title: key },
    select: { id: true },
  });

  if (existing) {
    await prisma.folderItem.update({
      where: { id: existing.id },
      data: { content, updatedAt: new Date(), createdBy: me },
    });
  } else {
    await prisma.folderItem.create({
      data: {
        folderId,
        type: "section_json",
        title: key,
        content,
        createdBy: me,
        updatedAt: new Date(),
      },
      select: { id: true },
    });
  }

  revalidatePath(`/app/folders/${folderId}`);
}

export async function saveResultsJsonFromForm(formData: FormData): Promise<void>;
export async function saveResultsJsonFromForm(folderId: string, formData: FormData): Promise<void>;
export async function saveResultsJsonFromForm(a: any, b?: any): Promise<void> {
  const formData = a instanceof FormData ? a : (b as FormData);
  const folderId = a instanceof FormData ? String(formData.get("folderId") ?? "").trim() : String(a ?? "").trim();
  const json = safeJsonStringFromForm(formData, "json");

  const fd = new FormData();
  fd.set("folderId", folderId);
  fd.set("key", "results");
  fd.set("json", json);

  await saveSectionFromForm(fd);
}

export async function saveUpcomingJsonFromForm(formData: FormData): Promise<void>;
export async function saveUpcomingJsonFromForm(folderId: string, formData: FormData): Promise<void>;
export async function saveUpcomingJsonFromForm(a: any, b?: any): Promise<void> {
  const formData = a instanceof FormData ? a : (b as FormData);
  const folderId = a instanceof FormData ? String(formData.get("folderId") ?? "").trim() : String(a ?? "").trim();
  const json = safeJsonStringFromForm(formData, "json");

  const fd = new FormData();
  fd.set("folderId", folderId);
  fd.set("key", "upcoming");
  fd.set("json", json);

  await saveSectionFromForm(fd);
}

export async function saveFolderProfileFromForm(formData: FormData): Promise<void>;
export async function saveFolderProfileFromForm(folderId: string, formData: FormData): Promise<void>;
export async function saveFolderProfileFromForm(a: any, b?: any): Promise<void> {
  const session = await auth();
  const me = requireEmail(session);
  await requireCoachUser();

  const formData = a instanceof FormData ? a : (b as FormData);
  const folderId = a instanceof FormData ? String(formData.get("folderId") ?? "").trim() : String(a ?? "").trim();

  if (!folderId) throw new Error("folderId missing");
  await requireFolderAccess(folderId, me, "editor");

  const athleteName = String(formData.get("athleteName") ?? "").trim();
  const sportIdRaw = String(formData.get("sportId") ?? "football").trim();
  const sportId: "football" | "dance" = sportIdRaw === "dance" ? "dance" : "football";

  const content = JSON.stringify({ athleteName, sportId });

  const existing = await prisma.folderItem.findFirst({
    where: { folderId, type: "profile" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.folderItem.update({
      where: { id: existing.id },
      data: { content, updatedAt: new Date(), createdBy: me },
    });
  } else {
    await prisma.folderItem.create({
      data: {
        folderId,
        type: "profile",
        title: "Profiili",
        content,
        createdBy: me,
        updatedAt: new Date(),
      },
      select: { id: true },
    });
  }

  revalidatePath(`/app/folders/${folderId}`);
  revalidatePath(`/app/folders/${folderId}/settings`);
}
