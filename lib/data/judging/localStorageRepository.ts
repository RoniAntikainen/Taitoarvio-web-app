"use client";

import { ReviewDraft, Role, Session, Workspace } from "@/lib/domain/judging/types";
import { CurrentUser, JudgingRepository } from "./repository";
import { demoDrafts, demoSessions, demoWorkspaces } from "./seed";

const STORAGE_KEY = "taitoarvio.judging.v2";

type DbState = {
  role: Role;
  sessions: Session[];
  workspaces: Workspace[];
  drafts: ReviewDraft[];
};

const fallbackState: DbState = {
  role: "coach",
  sessions: demoSessions,
  workspaces: demoWorkspaces,
  drafts: demoDrafts,
};

function readState(): DbState {
  if (typeof window === "undefined") return fallbackState;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }

  return JSON.parse(raw) as DbState;
}

function writeState(state: DbState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const localStorageRepository: JudgingRepository = {
  async getCurrentUser(): Promise<CurrentUser> {
    const state = readState();
    return {
      id: state.role === "coach" ? "coach-1" : "student-1",
      name: state.role === "coach" ? "Coach Anna" : "Oppilas Sofia",
      role: state.role,
    };
  },
  async setCurrentRole(role: Role): Promise<void> {
    const state = readState();
    writeState({ ...state, role });
  },
  async listWorkspaces(): Promise<Workspace[]> {
    return readState().workspaces;
  },
  async listSessions(): Promise<Session[]> {
    return readState().sessions;
  },
  async getSession(sessionId: string): Promise<Session | undefined> {
    return readState().sessions.find((session) => session.id === sessionId);
  },
  async saveSession(session: Session): Promise<void> {
    const state = readState();
    const sessions = state.sessions.some((s) => s.id === session.id)
      ? state.sessions.map((item) => (item.id === session.id ? session : item))
      : [...state.sessions, session];

    writeState({ ...state, sessions });
  },
  async getDraft(sessionId: string, userId: string): Promise<ReviewDraft | undefined> {
    return readState().drafts.find((draft) => draft.sessionId === sessionId && draft.authorId === userId);
  },
  async saveDraft(draft: ReviewDraft): Promise<void> {
    const state = readState();
    const drafts = state.drafts.some((item) => item.sessionId === draft.sessionId && item.authorId === draft.authorId)
      ? state.drafts.map((item) => (item.sessionId === draft.sessionId && item.authorId === draft.authorId ? draft : item))
      : [...state.drafts, draft];

    writeState({ ...state, drafts });
  },
};
