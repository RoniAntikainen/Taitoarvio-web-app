// app/actions/meetings.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEmail, requireFolderAccess } from "@/lib/access";
import { requireCurrentUser } from "@/lib/auth/session";
import { canCreateSession } from "@/lib/auth/permissions";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  return "Tuntematon virhe";
}

function toDateLocal(input: string) {
  // input: "YYYY-MM-DDTHH:mm" from <input type="datetime-local">
  const s = String(input ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function listFolderMeetings(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireFolderAccess(folderId, me, "viewer");

  return prisma.meeting.findMany({
    where: { folderId },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      location: true,
      agenda: true,
      notes: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createFolderMeeting(
  folderId: string,
  payload: {
    title: string;
    startsAt: string;
    endsAt?: string;
    location?: string;
    agenda?: string;
    notes?: string;
  }
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth();
    const me = requireEmail(session);
    const user = await requireCurrentUser();
    if (!canCreateSession(user)) return { ok: false, error: "Vain coach voi luoda sessioita." };
    await requireFolderAccess(folderId, me, "editor");

    const title = String(payload.title ?? "").trim();
    if (!title) return { ok: false, error: "Tapaamisen otsikko puuttuu." };

    const starts = toDateLocal(payload.startsAt);
    if (!starts) return { ok: false, error: "Päivä/aika puuttuu tai on virheellinen." };

    const ends = payload.endsAt ? toDateLocal(payload.endsAt) : null;
    if (ends && ends.getTime() < starts.getTime()) {
      return { ok: false, error: "Loppuaika ei voi olla ennen alkua." };
    }

    const m = await prisma.meeting.create({
      data: {
        folderId,
        title,
        startsAt: starts,
        endsAt: ends,
        location: String(payload.location ?? "").trim(),
        agenda: String(payload.agenda ?? "").trim(),
        notes: String(payload.notes ?? "").trim(),
        createdBy: me,
      },
      select: { id: true },
    });

    revalidatePath(`/app/folders/${folderId}`);
    revalidatePath("/app/calendar");
    return { ok: true, data: { id: m.id } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateMeeting(
  meetingId: string,
  patch: {
    title?: string;
    startsAt?: string;
    endsAt?: string;
    location?: string;
    agenda?: string;
    notes?: string;
  }
): Promise<ActionResult<{ ok: true }>> {
  try {
    const session = await auth();
    const me = requireEmail(session);
    const user = await requireCurrentUser();
    if (!canCreateSession(user)) return { ok: false, error: "Vain coach voi hallita sessioita." };

    const current = await prisma.meeting.findUnique({
      where: { id: String(meetingId) },
      select: { id: true, folderId: true, startsAt: true },
    });
    if (!current) return { ok: false, error: "Tapaamista ei löytynyt." };

    await requireFolderAccess(current.folderId, me, "editor");

    const data: any = {};

    if (patch.title !== undefined) {
      const t = String(patch.title).trim();
      if (!t) return { ok: false, error: "Otsikko ei voi olla tyhjä." };
      data.title = t;
    }

    if (patch.startsAt !== undefined) {
      const s = toDateLocal(patch.startsAt);
      if (!s) return { ok: false, error: "Virheellinen aloitusaika." };
      data.startsAt = s;
    }

    if (patch.endsAt !== undefined) {
      const e = patch.endsAt ? toDateLocal(patch.endsAt) : null;
      if (e && data.startsAt && e.getTime() < (data.startsAt as Date).getTime()) {
        return { ok: false, error: "Loppuaika ei voi olla ennen alkua." };
      }
      data.endsAt = e;
    }

    if (patch.location !== undefined) data.location = String(patch.location ?? "").trim();
    if (patch.agenda !== undefined) data.agenda = String(patch.agenda ?? "").trim();
    if (patch.notes !== undefined) data.notes = String(patch.notes ?? "").trim();

    await prisma.meeting.update({ where: { id: current.id }, data });

    revalidatePath(`/app/folders/${current.folderId}`);
    revalidatePath("/app/calendar");
    return { ok: true, data: { ok: true } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteMeeting(meetingId: string): Promise<ActionResult<{ ok: true }>> {
  try {
    const session = await auth();
    const me = requireEmail(session);
    const user = await requireCurrentUser();
    if (!canCreateSession(user)) return { ok: false, error: "Vain coach voi poistaa sessioita." };

    const current = await prisma.meeting.findUnique({
      where: { id: String(meetingId) },
      select: { id: true, folderId: true },
    });
    if (!current) return { ok: true, data: { ok: true } };

    await requireFolderAccess(current.folderId, me, "editor");

    await prisma.meeting.delete({ where: { id: current.id } });

    revalidatePath(`/app/folders/${current.folderId}`);
    revalidatePath("/app/calendar");
    return { ok: true, data: { ok: true } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function listMyCalendarMeetings(range?: { from?: Date; to?: Date }) {
  const session = await auth();
  const me = requireEmail(session);

  const where: any = {
    folder: { members: { some: { userEmail: me } } },
  };

  if (range?.from || range?.to) {
    where.startsAt = {};
    if (range.from) where.startsAt.gte = range.from;
    if (range.to) where.startsAt.lte = range.to;
  }

  return prisma.meeting.findMany({
    where,
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      location: true,
      agenda: true,
      notes: true,
      folderId: true,
      folder: { select: { name: true } },
    },
  });
}
