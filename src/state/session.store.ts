import { create } from "zustand";

import {
  bootstrapSession,
  getCurrentUser,
} from "@/features/auth/services/auth.service";
import type { User } from "@/features/auth/types/auth.types";
import { useWorkspaceStore } from "@/state/workspace.store";

export type SessionStatus = "idle" | "initializing" | "ready" | "unauthenticated";

type SessionState = {
  user: User | null;
  status: SessionStatus;
  hydrate: (user: User) => void;
  initialize: () => Promise<void>;
  refreshUser: () => Promise<void>;
  reset: () => void;
};

let initializePromise: Promise<void> | null = null;

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  status: "idle",
  hydrate: (user) => {
    set({ user, status: "ready" });
    useWorkspaceStore.getState().hydrateFromUser(user);
  },
  initialize: () => {
    const { status, user } = get();
    if (status === "ready" && user) {
      return Promise.resolve();
    }

    if (initializePromise) {
      return initializePromise;
    }

    set({ status: "initializing" });
    initializePromise = (async () => {
      try {
        const nextUser = await bootstrapSession();
        if (!nextUser) {
          set({ user: null, status: "unauthenticated" });
          return;
        }

        get().hydrate(nextUser);
      } catch {
        set({ user: null, status: "unauthenticated" });
      } finally {
        if (get().status !== "ready") {
          initializePromise = null;
        }
      }
    })();

    return initializePromise;
  },
  refreshUser: async () => {
    const user = await getCurrentUser();
    if (user) {
      get().hydrate(user);
      return;
    }

    get().reset();
  },
  reset: () => {
    initializePromise = null;
    set({ user: null, status: "idle" });
    useWorkspaceStore.getState().reset();
  },
}));
