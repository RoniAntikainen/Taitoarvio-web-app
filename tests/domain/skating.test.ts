import assert from "node:assert/strict";
import { aggregatePlacements, computeSkating } from "../../lib/domain/judging/scoring";
import { Session } from "../../lib/domain/judging/types";

const session: Session = {
  id: "s1",
  workspaceId: "w1",
  title: "test",
  sportId: "dance-standard-latin",
  roundName: "finaali",
  heatName: "h1",
  mode: "deep",
  competitors: [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ],
  comments: [],
  judgeCards: [
    { judgeId: "j1", judgeName: "J1", placements: ["a", "b", "c"] },
    { judgeId: "j2", judgeName: "J2", placements: ["b", "a", "c"] },
    { judgeId: "j3", judgeName: "J3", placements: ["a", "c", "b"] },
  ],
};

const aggregate = aggregatePlacements(session);
assert.equal(aggregate[0].competitorId, "a");
assert.equal(aggregate[0].totalPoints, 4);

const skating = computeSkating(session);
assert.equal(skating[0].competitorId, "a");
assert.equal(skating[0].place, 1);

console.log("skating.test.ts passed");
