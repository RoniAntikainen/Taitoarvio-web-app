import test from "node:test";
import assert from "node:assert/strict";
import { calculateSkatingResults } from "../skating";

test("calculateSkatingResults builds majority-based final order", () => {
  const results = calculateSkatingResults([
    { judgeId: "j1", sessionId: "s1", placements: ["c1", "c2", "c3"], lockedAt: "2026-01-01" },
    { judgeId: "j2", sessionId: "s1", placements: ["c2", "c1", "c3"], lockedAt: "2026-01-01" },
    { judgeId: "j3", sessionId: "s1", placements: ["c1", "c3", "c2"], lockedAt: "2026-01-01" },
  ]);

  assert.deepEqual(results.map((item) => item.coupleId), ["c1", "c2", "c3"]);
  assert.equal(results[0].firstPlaces, 2);
});

test("calculateSkatingResults returns empty for no judges", () => {
  assert.deepEqual(calculateSkatingResults([]), []);
});
