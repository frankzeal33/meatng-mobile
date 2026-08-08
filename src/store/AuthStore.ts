import type { AuthState } from "@/types/stores";
import { create } from "zustand";

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  token: null,
  isLoading: true,

  login: (token: string) =>
    set(() => ({
      isAuthenticated: true,
      token,
      isLoading: false,
    })),

  logout: () =>
    set(() => ({
      isAuthenticated: false,
      token: null,
      isLoading: false,
    })),

  setLoading: (loading: boolean) =>
    set(() => ({
      isLoading: loading,
    })),
}));
