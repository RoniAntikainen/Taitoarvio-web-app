import { ReviewDraft, Session, Workspace } from "@/lib/domain/judging/types";

export const demoWorkspaces: Workspace[] = [
  { id: "ws-1", name: "Kevätleiri 2026", ownerId: "coach-1", coachIds: ["coach-1", "coach-2", "coach-3"], sessionIds: ["session-1"] },
  { id: "ws-2", name: "Harjoituskisat opiskelijoille", ownerId: "coach-1", coachIds: ["coach-1"], sessionIds: ["session-2"] },
];

export const demoSessions: Session[] = [
  {
    id: "session-1",
    workspaceId: "ws-1",
    title: "Latin A - Finaali",
    sportId: "dance-standard-latin",
    roundName: "Finaali",
    heatName: "Heat 1",
    mode: "deep",
    competitors: [
      { id: "pair-12", name: "Pari 12", club: "Helsinki Dance" },
      { id: "pair-33", name: "Pari 33", club: "Oulu Ballroom" },
      { id: "pair-52", name: "Pari 52", club: "Turku Latin" },
      { id: "pair-67", name: "Pari 67", club: "Tampere Team" },
    ],
    judgeCards: [
      { judgeId: "coach-1", judgeName: "Coach Anna", placements: ["pair-33", "pair-12", "pair-52", "pair-67"], lockedAt: new Date().toISOString() },
      { judgeId: "coach-2", judgeName: "Coach Leo", placements: ["pair-12", "pair-33", "pair-67", "pair-52"], lockedAt: new Date().toISOString() },
      { judgeId: "coach-3", judgeName: "Coach Mila", placements: ["pair-33", "pair-52", "pair-12", "pair-67"], lockedAt: new Date().toISOString() },
    ],
    comments: [
      { id: "comment-1", author: "Sofia", role: "student", message: "Pari 33:n lattian käyttö oli tosi hyvä.", createdAt: new Date().toISOString(), targetId: "pair-33" },
    ],
  },
  {
    id: "session-2",
    workspaceId: "ws-2",
    title: "Vakio - harjoituskatselu",
    sportId: "dance-standard-latin",
    roundName: "Semifinaali",
    heatName: "Heat 2",
    mode: "quick",
    competitors: [
      { id: "pair-11", name: "Pari 11" },
      { id: "pair-28", name: "Pari 28" },
      { id: "pair-49", name: "Pari 49" },
    ],
    judgeCards: [],
    comments: [],
  },
];

export const demoDrafts: ReviewDraft[] = [];
