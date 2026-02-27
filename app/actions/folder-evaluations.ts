// app/actions/folder-evaluations.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireEmail, requireFolderAccess, getEntitlement } from "@/lib/access";
import { assertEvaluationLimit } from "@/lib/limits";

type CreateEvaluationInput = {
  folderId: string;
  subject?: string;
  evaluator?: string;
  sportLabel?: string;
  data: any;
};

function toJsonString(v: any) {
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v ?? {});
  } catch {
    return JSON.stringify({});
  }
}

function parseJsonString<T>(s: any, fallback: T): T {
  if (typeof s !== "string") return fallback;
  const t = s.trim();
  if (!t) return fallback;
  try {
    return (JSON.parse(t) ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export async function createEvaluation(input: CreateEvaluationInput) {
  const session = await auth();
  const me = requireEmail(session);

  const folderId = String(input.folderId);
  await requireFolderAccess(folderId, me, "viewer");

  const ent = getEntitlement(session);
  await assertEvaluationLimit(folderId, ent.status);

  const ev = await prisma.evaluation.create({
    data: {
      folderId,
      subject: String(input.subject ?? "").trim() || "Arviointi",
      evaluator: String(input.evaluator ?? me).trim() || me,
      sportLabel: String(input.sportLabel ?? "").trim(),
      data: toJsonString(input.data),
    },
    select: { id: true },
  });

  revalidatePath(`/app/folders/${folderId}`);
  revalidatePath(`/app/folders/${folderId}/evaluations`);
  return ev.id;
}

export async function updateEvaluation(
  evaluationId: string,
  patch: Partial<Omit<CreateEvaluationInput, "folderId">>
) {
  const session = await auth();
  const me = requireEmail(session);

  const current = await prisma.evaluation.findUnique({
    where: { id: String(evaluationId) },
    select: { id: true, folderId: true },
  });
  if (!current) throw new Error("Evaluation not found");

  await requireFolderAccess(current.folderId, me, "editor");

  await prisma.evaluation.update({
    where: { id: current.id },
    data: {
      subject: patch.subject !== undefined ? String(patch.subject).trim() || "Arviointi" : undefined,
      evaluator: patch.evaluator !== undefined ? String(patch.evaluator).trim() || me : undefined,
      sportLabel: patch.sportLabel !== undefined ? String(patch.sportLabel ?? "").trim() : undefined,
      data: patch.data !== undefined ? toJsonString(patch.data) : undefined,
    },
  });

  revalidatePath(`/app/folders/${current.folderId}`);
  revalidatePath(`/app/folders/${current.folderId}/evaluations`);
  return { ok: true };
}

export async function deleteEvaluation(evaluationId: string) {
  const session = await auth();
  const me = requireEmail(session);

  const current = await prisma.evaluation.findUnique({
    where: { id: String(evaluationId) },
    select: { id: true, folderId: true },
  });
  if (!current) return { ok: true };

  await requireFolderAccess(current.folderId, me, "editor");
  await prisma.evaluation.delete({ where: { id: current.id } });

  revalidatePath(`/app/folders/${current.folderId}`);
  revalidatePath(`/app/folders/${current.folderId}/evaluations`);
  return { ok: true };
}

export async function getEvaluation(evaluationId: string) {
  const session = await auth();
  const me = requireEmail(session);

  const ev = await prisma.evaluation.findUnique({
    where: { id: String(evaluationId) },
    select: {
      id: true,
      folderId: true,
      subject: true,
      evaluator: true,
      sportLabel: true,
      createdAt: true,
      data: true,
    },
  });
  if (!ev) throw new Error("Evaluation not found");

  await requireFolderAccess(ev.folderId, me, "viewer");
  return {
    ...ev,
    data: parseJsonString(ev.data, {} as any),
  };
}

export async function listEvaluations(folderId: string) {
  const session = await auth();
  const me = requireEmail(session);

  const fid = String(folderId);
  await requireFolderAccess(fid, me, "viewer");

  const rows = await prisma.evaluation.findMany({
    where: { folderId: fid },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      folderId: true,
      subject: true,
      evaluator: true,
      sportLabel: true,
      createdAt: true,
      data: true,
    },
  });

  return rows.map((r) => ({
    ...r,
    data: parseJsonString(r.data, {} as any),
  }));
}

/**
 * Server Action formille.
 * Sivu käyttää: action={createFolderEvaluationFromForm.bind(null, folderId)}
 */
export async function createFolderEvaluationFromForm(folderId: string, formData: FormData): Promise<void>;
export async function createFolderEvaluationFromForm(formData: FormData): Promise<void>;
export async function createFolderEvaluationFromForm(a: any, b?: any): Promise<void> {
  const folderId = a instanceof FormData ? String(a.get("folderId") ?? "").trim() : String(a ?? "").trim();
  const formData = a instanceof FormData ? a : (b as FormData);
  if (!folderId) throw new Error("folderId missing");

  const subject = String(formData.get("subject") ?? "").trim();
  const evaluator = String(formData.get("evaluator") ?? "").trim();
  const sportId = String(formData.get("sportId") ?? "").trim();
  const sportLabel = sportId || String(formData.get("sportLabel") ?? "").trim();

  const scores: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("score:")) continue;
    const area = k.slice("score:".length);
    const val = String(v ?? "");
    if (area) scores[area] = val;
  }

  const notes = String(formData.get("notes") ?? "").trim();
  const data = { scores, notes };

  await createEvaluation({
    folderId,
    subject,
    evaluator,
    sportLabel,
    data,
  });
}
