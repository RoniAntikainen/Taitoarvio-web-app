"use client";

import { JudgingRepository } from "@/src/data/repository";
import { COMMENTS, COUPLES, LOCKED_RANKINGS, SESSIONS, WORKSPACES } from "@/src/data/seed";
import { SessionComment } from "@/src/domain/models";

const commentsKey = "taitoarvio.comments";

function readCommentsStore(): Record<string, SessionComment[]> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(commentsKey);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as Record<string, SessionComment[]>;
  } catch {
    return {};
  }
}

function writeCommentsStore(payload: Record<string, SessionComment[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(commentsKey, JSON.stringify(payload));
}

export function createLocalStorageRepository(): JudgingRepository {
  return {
    async listWorkspaces() {
      return WORKSPACES;
    },
    async listSessions() {
      return SESSIONS;
    },
    async listCouples() {
      return COUPLES;
    },
    async listLockedRankings(sessionId) {
      return LOCKED_RANKINGS.filter((ranking) => ranking.sessionId === sessionId);
    },
    async listComments(sessionId) {
      const store = readCommentsStore();
      return [...COMMENTS.filter((comment) => comment.targetId === sessionId), ...(store[sessionId] ?? [])];
    },
    async saveComment(sessionId, comment) {
      const store = readCommentsStore();
      const updated = [...(store[sessionId] ?? []), comment];
      writeCommentsStore({ ...store, [sessionId]: updated });
    },
  };
}
