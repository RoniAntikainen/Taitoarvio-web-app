export type Role = "student" | "coach";
export type ReviewMode = "deep" | "quick";

export interface RubricCriterion {
  id: string;
  label: string;
  description: string;
}

export interface RubricElement {
  id: string;
  label: string;
  criteria: RubricCriterion[];
}

export interface SportDefinition {
  id: string;
  name: string;
  discipline: string;
  deepRubric: RubricElement[];
  quickRubric: RubricElement[];
}

export interface Couple {
  id: string;
  name: string;
  club: string;
}

export interface ScoreCard {
  judgeId: string;
  sessionId: string;
  coupleId: string;
  mode: ReviewMode;
  scores: Record<string, number>;
  note?: string;
}

export interface LockedRanking {
  judgeId: string;
  sessionId: string;
  placements: string[];
  lockedAt: string;
}

export interface SessionComment {
  id: string;
  role: Role;
  author: string;
  message: string;
  target: "session" | "couple" | "criterion";
  targetId: string;
  createdAt: string;
}

export interface JudgingSession {
  id: string;
  name: string;
  sportId: string;
  roundName: string;
  heatName: string;
  coupleIds: string[];
  workspaceId: string;
  studentShareLink: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerCoachId: string;
  coachIds: string[];
  sessionIds: string[];
}

export interface AggregateResult {
  coupleId: string;
  firstPlaces: number;
  totalRankPoints: number;
  finalRank: number;
}
