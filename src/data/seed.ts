import { Couple, JudgingSession, LockedRanking, SessionComment, SportDefinition, Workspace } from "@/src/domain/models";

export const SPORTS: SportDefinition[] = [
  {
    id: "dance-standard",
    name: "Tanssi",
    discipline: "Vakio / Latin",
    deepRubric: [
      {
        id: "timing",
        label: "Musiikillisuus",
        criteria: [
          { id: "timing-1", label: "Ajoitus", description: "Pysyvyys rytmissä ja fraasissa." },
          { id: "timing-2", label: "Dynamiikka", description: "Musiikin dynamiikan tulkinta." },
        ],
      },
      {
        id: "technique",
        label: "Tekniikka",
        criteria: [
          { id: "tech-1", label: "Linjat", description: "Kehon linjaus ja asento." },
          { id: "tech-2", label: "Footwork", description: "Jalkatekniikan puhtaus." },
          { id: "tech-3", label: "Parikontakti", description: "Yhteys pariin." },
        ],
      },
    ],
    quickRubric: [
      {
        id: "impact",
        label: "Kokonaisvaikutelma",
        criteria: [
          { id: "impact-1", label: "Kokonaisuus", description: "Yleinen vaikutelma suorituksesta." },
          { id: "impact-2", label: "Avainkohta", description: "Kehitystä vaativa painopiste." },
        ],
      },
    ],
  },
];

export const COUPLES: Couple[] = [
  { id: "c1", name: "Aino & Eero", club: "Taito Club" },
  { id: "c2", name: "Mira & Onni", club: "StepLine" },
  { id: "c3", name: "Sofia & Leevi", club: "Ballroom Helsinki" },
  { id: "c4", name: "Emma & Joona", club: "Nordic Dance" },
];

export const WORKSPACES: Workspace[] = [
  {
    id: "w1",
    name: "Kevätkausi 2026",
    ownerCoachId: "coach-1",
    coachIds: ["coach-1", "coach-2", "coach-3"],
    sessionIds: ["s1", "s2"],
  },
];

export const SESSIONS: JudgingSession[] = [
  {
    id: "s1",
    name: "Harjoituskisa #1",
    sportId: "dance-standard",
    roundName: "Semifinaali",
    heatName: "Erä A",
    coupleIds: ["c1", "c2", "c3", "c4"],
    workspaceId: "w1",
    studentShareLink: "https://demo.taitoarvio/app/session/s1?role=student",
  },
  {
    id: "s2",
    name: "Harjoituskisa #2",
    sportId: "dance-standard",
    roundName: "Finaali",
    heatName: "Erä B",
    coupleIds: ["c1", "c2", "c3"],
    workspaceId: "w1",
    studentShareLink: "https://demo.taitoarvio/app/session/s2?role=student",
  },
];

export const LOCKED_RANKINGS: LockedRanking[] = [
  { judgeId: "coach-1", sessionId: "s1", placements: ["c3", "c1", "c2", "c4"], lockedAt: "2026-01-10" },
  { judgeId: "coach-2", sessionId: "s1", placements: ["c1", "c3", "c2", "c4"], lockedAt: "2026-01-10" },
  { judgeId: "coach-3", sessionId: "s1", placements: ["c3", "c2", "c1", "c4"], lockedAt: "2026-01-10" },
];

export const COMMENTS: SessionComment[] = [
  {
    id: "com-1",
    role: "student",
    author: "Oppilas / Nelli",
    message: "Pari c2 piti rytmin hyvin quickstepissä.",
    target: "couple",
    targetId: "c2",
    createdAt: "2026-01-10T15:10:00.000Z",
  },
];
