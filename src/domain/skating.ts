import { AggregateResult, LockedRanking } from "./models";

interface PlacementSnapshot {
  coupleId: string;
  majorityAtPlace: number;
  sumForPlace: number;
}

export function calculateSkatingResults(rankings: LockedRanking[]): AggregateResult[] {
  if (!rankings.length) return [];

  const judgeCount = rankings.length;
  const majority = Math.floor(judgeCount / 2) + 1;
  const couples = Array.from(new Set(rankings.flatMap((ranking) => ranking.placements)));
  const maxPlace = couples.length;

  const snapshots: PlacementSnapshot[] = couples.map((coupleId) => {
    for (let place = 1; place <= maxPlace; place += 1) {
      const placeHits = rankings
        .map((ranking) => ranking.placements.indexOf(coupleId) + 1)
        .filter((p) => p > 0 && p <= place);

      if (placeHits.length >= majority) {
        return {
          coupleId,
          majorityAtPlace: place,
          sumForPlace: placeHits.reduce((sum, p) => sum + p, 0),
        };
      }
    }

    const fallbackPlacements = rankings.map((ranking) => ranking.placements.indexOf(coupleId) + 1);
    return {
      coupleId,
      majorityAtPlace: maxPlace,
      sumForPlace: fallbackPlacements.reduce((sum, p) => sum + p, 0),
    };
  });

  snapshots.sort((a, b) => {
    if (a.majorityAtPlace !== b.majorityAtPlace) return a.majorityAtPlace - b.majorityAtPlace;
    return a.sumForPlace - b.sumForPlace;
  });

  return snapshots.map((snapshot, index) => ({
    coupleId: snapshot.coupleId,
    firstPlaces: rankings.filter((ranking) => ranking.placements[0] === snapshot.coupleId).length,
    totalRankPoints: rankings.reduce((sum, ranking) => sum + ranking.placements.indexOf(snapshot.coupleId) + 1, 0),
    finalRank: index + 1,
  }));
}
