export type Role = "student" | "coach";
export type ReviewMode = "deep" | "quick";

export type RubricCriterion = {
  id: string;
  label: string;
  description: string;
  levelDescriptions: Record<number, string>;
};

export type RubricElement = {
  id: string;
  label: string;
  criteria: RubricCriterion[];
};

export type SportDefinition = {
  id: string;
  label: string;
  style?: string;
  rubric: RubricElement[];
};

export type Competitor = {
  id: string;
  name: string;
  club?: string;
};

export type JudgeCard = {
  judgeId: string;
  judgeName: string;
  placements: string[];
  lockedAt?: string;
};

export type SessionComment = {
  id: string;
  author: string;
  role: Role;
  message: string;
  createdAt: string;
  targetId?: string;
};

export type Session = {
  id: string;
  workspaceId: string;
  title: string;
  sportId: string;
  roundName: string;
  heatName: string;
  mode: ReviewMode;
  competitors: Competitor[];
  judgeCards: JudgeCard[];
  comments: SessionComment[];
};

export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  coachIds: string[];
  sessionIds: string[];
};

export type DeepEntry = {
  competitorId: string;
  elementId: string;
  criterionId: string;
  score: number;
  note?: string;
};

export type ReviewDraft = {
  sessionId: string;
  authorId: string;
  role: Role;
  mode: ReviewMode;
  deepEntries: DeepEntry[];
  quickScores: Record<string, number>;
  notesByCompetitor: Record<string, string>;
  locked: boolean;
};

export type PlacementAggregate = {
  competitorId: string;
  placements: number[];
  totalPoints: number;
  averagePlacement: number;
};

export type SkatingRow = {
  competitorId: string;
  majorityByPlace: Record<number, number>;
  place: number;
};
