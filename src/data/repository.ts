import { Couple, JudgingSession, LockedRanking, SessionComment, Workspace } from "@/src/domain/models";

export interface JudgingRepository {
  listWorkspaces(): Promise<Workspace[]>;
  listSessions(): Promise<JudgingSession[]>;
  listCouples(): Promise<Couple[]>;
  listLockedRankings(sessionId: string): Promise<LockedRanking[]>;
  listComments(sessionId: string): Promise<SessionComment[]>;
  saveComment(sessionId: string, comment: SessionComment): Promise<void>;
}
