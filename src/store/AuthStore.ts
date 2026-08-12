import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

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
