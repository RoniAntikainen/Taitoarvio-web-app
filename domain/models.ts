export type AppRole = "student" | "coach";

export type CoachFolderRole = "owner" | "admin" | "coach" | "viewer";

export type Folder = {
  id: string;
  name: string;
  sportId: string;
  ownerId: string;
  createdAt: string;
};

export type Membership = {
  folderId: string;
  userId: string;
  role: CoachFolderRole;
  invitedBy: string;
};

export type EvaluationMode = "light" | "deep";

export type Evaluation = {
  id: string;
  folderId: string;
  title: string;
  sportId: string;
  mode: EvaluationMode;
  participantIds: string[];
  sharedWithStudentIds: string[];
};

export type RubricLevel = {
  level: number;
  title: string;
  description: string;
};

export type RubricCriterion = {
  id: string;
  label: string;
  weight: number;
  levels: RubricLevel[];
};

export type Rubric = {
  id: string;
  sportId: string;
  name: string;
  criteria: RubricCriterion[];
};

export type JudgePlacement = {
  participantId: string;
  place: number;
};

export type JudgeResult = {
  evaluationId: string;
  judgeId: string;
  placements: JudgePlacement[];
  rubricScoreByParticipant: Record<string, number>;
};

export type Comment = {
  id: string;
  evaluationId: string;
  authorId: string;
  body: string;
  createdAt: string;
};
