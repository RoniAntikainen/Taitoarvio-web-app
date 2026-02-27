"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireEmail, requireFolderAccess } from "@/lib/access";
import { revalidatePath } from "next/cache";

type JudgingMode = "light" | "deep";

type JudgingPayload = {
  type: "judging";
  mode: JudgingMode;
  participants: string[];
  judges: string[];
  judgeResults: Record<string, Record<string, number>>;
  comments: Array<{ author: string; body: string; createdAt: string }>;
};

function parsePayload(raw: string): JudgingPayload | null {
  try {
    const v = JSON.parse(raw);
    if (v?.type !== "judging") return null;
    return {
      type: "judging",
      mode: v.mode === "light" ? "light" : "deep",
      participants: Array.isArray(v.participants) ? v.participants.map(String) : [],
      judges: Array.isArray(v.judges) ? v.judges.map(String) : [],
      judgeResults: v.judgeResults && typeof v.judgeResults === "object" ? v.judgeResults : {},
      comments: Array.isArray(v.comments) ? v.comments : [],
    };
  } catch {
    return null;
  }
}

export async function listJudgingFolders() {
  const session = await auth();
  const me = requireEmail(session);

  return prisma.folder.findMany({
    where: { members: { some: { userEmail: me } } },
    select: {
      id: true,
      name: true,
      ownerId: true,
      members: { where: { userEmail: me }, select: { role: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listJudgingEvaluations(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);
  await requireFolderAccess(folderId, me, "viewer");

  const rows = await prisma.evaluation.findMany({
    where: { folderId },
    orderBy: { createdAt: "desc" },
    select: { id: true, folderId: true, subject: true, createdAt: true, data: true },
  });

  return rows
    .map((row) => ({ ...row, payload: parsePayload(row.data) }))
    .filter((row) => row.payload)
    .map((row) => ({
      id: row.id,
      folderId: row.folderId,
      subject: row.subject,
      createdAt: row.createdAt,
      payload: row.payload as JudgingPayload,
    }));
}

export async function createJudgingEvaluation(formData: FormData) {
  const session = await auth();
  const me = requireEmail(session);

  const folderId = String(formData.get("folderId") ?? "");
  await requireFolderAccess(folderId, me, "editor");

  const subject = String(formData.get("subject") ?? "Simuloitu kisa").trim() || "Simuloitu kisa";
  const mode = String(formData.get("mode") ?? "deep") === "light" ? "light" : "deep";
  const participants = String(formData.get("participants") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload: JudgingPayload = {
    type: "judging",
    mode,
    participants,
    judges: [me],
    judgeResults: {},
    comments: [],
  };

  await prisma.evaluation.create({
    data: {
      folderId,
      subject,
      evaluator: me,
      sportLabel: "dance",
      data: JSON.stringify(payload),
    },
  });

  revalidatePath(`/app/judging?folderId=${folderId}`);
}

export async function submitJudgingResult(formData: FormData) {
  const session = await auth();
  const me = requireEmail(session);
  const evaluationId = String(formData.get("evaluationId") ?? "");

  const ev = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
  if (!ev) throw new Error("Arviointi puuttuu");

  await requireFolderAccess(ev.folderId, me, "editor");
  const payload = parsePayload(ev.data);
  if (!payload) throw new Error("Virheellinen arviointidata");

  const ranking: Record<string, number> = {};
  payload.participants.forEach((p) => {
    const raw = Number(formData.get(`place:${p}`));
    if (Number.isFinite(raw) && raw > 0) ranking[p] = raw;
  });

  payload.judgeResults[me] = ranking;
  if (!payload.judges.includes(me)) payload.judges.push(me);

  await prisma.evaluation.update({
    where: { id: ev.id },
    data: { data: JSON.stringify(payload), evaluator: me },
  });

  revalidatePath(`/app/judging?folderId=${ev.folderId}&evaluationId=${ev.id}`);
}

export async function addJudgingComment(formData: FormData) {
  const session = await auth();
  const me = requireEmail(session);
  const evaluationId = String(formData.get("evaluationId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const ev = await prisma.evaluation.findUnique({ where: { id: evaluationId } });
  if (!ev) throw new Error("Arviointi puuttuu");

  await requireFolderAccess(ev.folderId, me, "viewer");
  const payload = parsePayload(ev.data);
  if (!payload) throw new Error("Virheellinen arviointidata");

  payload.comments.unshift({ author: me, body, createdAt: new Date().toISOString() });

  await prisma.evaluation.update({ where: { id: ev.id }, data: { data: JSON.stringify(payload) } });

  revalidatePath(`/app/judging?folderId=${ev.folderId}&evaluationId=${ev.id}`);
}
