import { AggregateResult, LockedRanking, ScoreCard } from "./models";

export function computeAverageScore(card: ScoreCard): number {
  const values = Object.values(card.scores);
  if (!values.length) return 0;
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}

export function buildRankingFromScoreCards(cards: ScoreCard[]): string[] {
  const grouped = cards.reduce<Record<string, number[]>>((acc, card) => {
    acc[card.coupleId] ??= [];
    acc[card.coupleId].push(computeAverageScore(card));
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([coupleId, scores]) => ({
      coupleId,
      total: scores.reduce((sum, score) => sum + score, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .map((item) => item.coupleId);
}

export function aggregateJudgeRankings(rankings: LockedRanking[]): AggregateResult[] {
  if (!rankings.length) return [];

  const couples = new Set(rankings.flatMap((ranking) => ranking.placements));
  const coupleStats = Array.from(couples).map((coupleId) => {
    const placements = rankings
      .map((ranking) => ranking.placements.indexOf(coupleId))
      .filter((index) => index >= 0)
      .map((index) => index + 1);

    const firstPlaces = placements.filter((value) => value === 1).length;
    const totalRankPoints = placements.reduce((sum, value) => sum + value, 0);

    return {
      coupleId,
      firstPlaces,
      totalRankPoints,
      finalRank: 0,
    };
  });

  coupleStats.sort((a, b) => {
    if (b.firstPlaces !== a.firstPlaces) return b.firstPlaces - a.firstPlaces;
    return a.totalRankPoints - b.totalRankPoints;
  });

  return coupleStats.map((item, index) => ({ ...item, finalRank: index + 1 }));
}
