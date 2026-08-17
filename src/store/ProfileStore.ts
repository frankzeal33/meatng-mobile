import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

interface UserProfile {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

interface ProfileStore {
  userProfile: UserProfile;
  setProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const defaultUserProfile: UserProfile = {
  phoneNumber: "",
  firstName: "",
  lastName: "",
  email: "",
  isEmailVerified: false,
};

type PersistedProfile = Pick<ProfileStore, "userProfile">;

const profileStorage: PersistStorage<PersistedProfile> = {
  getItem: async (name) => {
    const storedValue = await AsyncStorage.getItem(name);
    if (!storedValue) return null;

    const parsed = JSON.parse(storedValue);

    // Support profiles saved before the Zustand persist migration.
    if (parsed?.state?.userProfile) return parsed;
    return { state: { userProfile: parsed } };
  },
  setItem: (name, value) =>
    AsyncStorage.setItem(name, JSON.stringify(value)),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      userProfile: defaultUserProfile,

      setProfile: async (profile) => {
        set({ userProfile: profile });
      },

      clearProfile: async () => {
        set({ userProfile: defaultUserProfile });
        await AsyncStorage.removeItem("userProfile");
      },
    }),
    {
      name: "userProfile",
      storage: profileStorage,
      partialize: (state) => ({ userProfile: state.userProfile }),
    },
  ),
);
