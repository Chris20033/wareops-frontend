import { create } from "zustand";

import type { AuthUserDto } from "@/lib/api/types";

export type SessionStatus =
  "idle" | "initializing" | "authenticated" | "unauthenticated";

export interface SessionState {
  accessToken: string | null;
  user: AuthUserDto | null;
  sessionId: string | null;
  status: SessionStatus;
  setSession: (payload: {
    accessToken: string;
    user: AuthUserDto;
    sessionId?: string | null;
  }) => void;
  setAccessToken: (accessToken: string) => void;
  updateUser: (user: AuthUserDto, sessionId?: string | null) => void;
  setStatus: (status: SessionStatus) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  user: null,
  sessionId: null,
  status: "idle",
  setSession: ({ accessToken, user, sessionId }) =>
    set((state) => ({
      accessToken,
      user,
      sessionId: sessionId !== undefined ? sessionId : state.sessionId,
      status: "authenticated",
    })),
  setAccessToken: (accessToken) =>
    set({
      accessToken,
      status: "authenticated",
    }),
  updateUser: (user, sessionId) =>
    set((state) => ({
      user,
      sessionId: sessionId !== undefined ? sessionId : state.sessionId,
    })),
  setStatus: (status) => set({ status }),
  clearSession: () =>
    set({
      accessToken: null,
      user: null,
      sessionId: null,
      status: "unauthenticated",
    }),
}));
