import { PlacementAggregate, ReviewDraft, Session, SkatingRow } from "./types";

export function computeDeepTotals(draft: ReviewDraft): Record<string, number> {
  return draft.deepEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.competitorId] = (acc[entry.competitorId] ?? 0) + entry.score;
    return acc;
  }, {});
}

export function rankByScore(scores: Record<string, number>): string[] {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([competitorId]) => competitorId);
}

export function aggregatePlacements(session: Session): PlacementAggregate[] {
  const competitorIds = session.competitors.map((c) => c.id);

  return competitorIds
    .map((competitorId) => {
      const placements = session.judgeCards
        .map((card) => card.placements.indexOf(competitorId))
        .filter((index) => index >= 0)
        .map((index) => index + 1);

      const totalPoints = placements.reduce((sum, place) => sum + place, 0);
      const averagePlacement = placements.length > 0 ? totalPoints / placements.length : Number.MAX_SAFE_INTEGER;

      return { competitorId, placements, totalPoints, averagePlacement };
    })
    .sort((a, b) => a.totalPoints - b.totalPoints || a.averagePlacement - b.averagePlacement);
}

function majorityCountAtOrAbove(placements: number[], threshold: number) {
  return placements.filter((place) => place <= threshold).length;
}

export function computeSkating(session: Session): SkatingRow[] {
  const judgeCount = session.judgeCards.length;
  const majorityNeeded = Math.floor(judgeCount / 2) + 1;
  const aggregates = aggregatePlacements(session);

  const rows = aggregates.map((agg) => {
    const majorityByPlace: Record<number, number> = {};
    for (let place = 1; place <= session.competitors.length; place += 1) {
      majorityByPlace[place] = majorityCountAtOrAbove(agg.placements, place);
    }

    return {
      competitorId: agg.competitorId,
      majorityByPlace,
      place: session.competitors.length,
    };
  });

  rows.sort((a, b) => {
    for (let place = 1; place <= session.competitors.length; place += 1) {
      const aHasMajority = a.majorityByPlace[place] >= majorityNeeded;
      const bHasMajority = b.majorityByPlace[place] >= majorityNeeded;
      if (aHasMajority !== bHasMajority) return aHasMajority ? -1 : 1;

      if (a.majorityByPlace[place] !== b.majorityByPlace[place]) {
        return b.majorityByPlace[place] - a.majorityByPlace[place];
      }
    }

    const aggA = aggregates.find((agg) => agg.competitorId === a.competitorId)!;
    const aggB = aggregates.find((agg) => agg.competitorId === b.competitorId)!;
    return aggA.totalPoints - aggB.totalPoints;
  });

  return rows.map((row, index) => ({ ...row, place: index + 1 }));
}
