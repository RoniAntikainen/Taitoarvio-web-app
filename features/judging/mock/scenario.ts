import type { Comment, Evaluation, Folder, JudgeResult, Membership } from "@/domain/models";

export const demoFolder: Folder = {
  id: "folder-1",
  name: "Tanssiakatemia / kevät",
  sportId: "dance",
  ownerId: "coach-a",
  createdAt: "2026-01-10T08:00:00.000Z",
};

export const demoMemberships: Membership[] = [
  { folderId: "folder-1", userId: "coach-a", role: "owner", invitedBy: "coach-a" },
  { folderId: "folder-1", userId: "coach-b", role: "coach", invitedBy: "coach-a" },
  { folderId: "folder-1", userId: "student-1", role: "viewer", invitedBy: "coach-a" },
];

export const demoEvaluation: Evaluation = {
  id: "eval-1",
  folderId: "folder-1",
  title: "Simuloitu kilpailu #1",
  sportId: "dance",
  mode: "deep",
  participantIds: ["pari-a", "pari-b", "pari-c"],
  sharedWithStudentIds: ["student-1"],
};

export const participantLabels: Record<string, string> = {
  "pari-a": "Pari A",
  "pari-b": "Pari B",
  "pari-c": "Pari C",
};

export const judgeResults: JudgeResult[] = [
  {
    evaluationId: "eval-1",
    judgeId: "coach-a",
    placements: [
      { participantId: "pari-a", place: 1 },
      { participantId: "pari-b", place: 3 },
      { participantId: "pari-c", place: 2 },
    ],
    rubricScoreByParticipant: { "pari-a": 8.7, "pari-b": 7.9, "pari-c": 8.3 },
  },
  {
    evaluationId: "eval-1",
    judgeId: "coach-b",
    placements: [
      { participantId: "pari-a", place: 2 },
      { participantId: "pari-b", place: 1 },
      { participantId: "pari-c", place: 3 },
    ],
    rubricScoreByParticipant: { "pari-a": 8.4, "pari-b": 8.8, "pari-c": 7.6 },
  },
];

export const demoComments: Comment[] = [
  {
    id: "c-1",
    evaluationId: "eval-1",
    authorId: "student-1",
    body: "Hyvä musiikin tulkinta! Huomio erityisesti vartalon linjoihin.",
    createdAt: "2026-02-12T10:20:00.000Z",
  },
];
