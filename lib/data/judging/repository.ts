import { ReviewDraft, Role, Session, Workspace } from "@/lib/domain/judging/types";

export type CurrentUser = {
  id: string;
  name: string;
  role: Role;
};

export type JudgingRepository = {
  getCurrentUser(): Promise<CurrentUser>;
  setCurrentRole(role: Role): Promise<void>;
  listWorkspaces(): Promise<Workspace[]>;
  listSessions(): Promise<Session[]>;
  getSession(sessionId: string): Promise<Session | undefined>;
  saveSession(session: Session): Promise<void>;
  getDraft(sessionId: string, userId: string): Promise<ReviewDraft | undefined>;
  saveDraft(draft: ReviewDraft): Promise<void>;
};
