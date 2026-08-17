import type { AuthState } from "@/types/stores";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

type PersistedAuth = Pick<
  AuthState,
  "isAuthenticated" | "token" | "refreshToken"
>;

const authStorage: PersistStorage<PersistedAuth> = {
  getItem: async () => {
    try {
      const [token, refreshToken] = await Promise.all([
        SecureStore.getItemAsync("accessToken"),
        SecureStore.getItemAsync("refreshToken"),
      ]);

      if (!token) return null;

      return {
        state: {
          isAuthenticated: true,
          token,
          refreshToken,
        },
      };
    } catch {
      return null;
    }
  },
  setItem: async (_name, value) => {
    const { token, refreshToken } = value.state;

    await Promise.all([
      token
        ? SecureStore.setItemAsync("accessToken", token)
        : SecureStore.deleteItemAsync("accessToken"),
      refreshToken
        ? SecureStore.setItemAsync("refreshToken", refreshToken)
        : SecureStore.deleteItemAsync("refreshToken"),
    ]);
  },
  removeItem: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync("accessToken"),
      SecureStore.deleteItemAsync("refreshToken"),
    ]);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
      isLoading: true,

      login: async (token, refreshToken) => {
        await Promise.all([
          SecureStore.setItemAsync("accessToken", token),
          refreshToken
            ? SecureStore.setItemAsync("refreshToken", refreshToken)
            : Promise.resolve(),
        ]);

        set((state) => ({
          isAuthenticated: true,
          token,
          refreshToken: refreshToken ?? state.refreshToken,
          isLoading: false,
        }));
      },

      logout: async () => {
        await Promise.all([
          SecureStore.deleteItemAsync("accessToken"),
          SecureStore.deleteItemAsync("refreshToken"),
        ]);

        set({
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "auth-session",
      storage: authStorage,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    },
  ),
);
