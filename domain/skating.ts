import type { JudgeResult } from "@/domain/models";

export type CombinedPlacement = {
  participantId: string;
  finalPlace: number;
  firstPlaceVotes: number;
  averagePlace: number;
};

export function combinePlacements(results: JudgeResult[]): CombinedPlacement[] {
  const participantIds = new Set<string>();
  results.forEach((r) => r.placements.forEach((p) => participantIds.add(p.participantId)));

  const rows = [...participantIds].map((participantId) => {
    const placements = results
      .map((r) => r.placements.find((p) => p.participantId === participantId)?.place)
      .filter((p): p is number => typeof p === "number");

    const firstPlaceVotes = placements.filter((p) => p === 1).length;
    const averagePlace = placements.length
      ? placements.reduce((sum, v) => sum + v, 0) / placements.length
      : Number.MAX_SAFE_INTEGER;

    return { participantId, firstPlaceVotes, averagePlace };
  });

  rows.sort((a, b) => {
    if (b.firstPlaceVotes !== a.firstPlaceVotes) return b.firstPlaceVotes - a.firstPlaceVotes;
    if (a.averagePlace !== b.averagePlace) return a.averagePlace - b.averagePlace;
    return a.participantId.localeCompare(b.participantId);
  });

  return rows.map((row, index) => ({ ...row, finalPlace: index + 1 }));
}

export function averageRubricScore(results: JudgeResult[]): Record<string, number> {
  const allKeys = new Set<string>();
  results.forEach((r) => Object.keys(r.rubricScoreByParticipant).forEach((k) => allKeys.add(k)));

  const out: Record<string, number> = {};
  allKeys.forEach((id) => {
    const scores = results
      .map((r) => r.rubricScoreByParticipant[id])
      .filter((v): v is number => typeof v === "number");

    out[id] = scores.length ? Number((scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(2)) : 0;
  });

  return out;
}
