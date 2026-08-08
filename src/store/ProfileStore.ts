import type { ProfileStore, UserProfile } from "@/types/stores";
import { create } from "zustand";

const defaultUserProfile: UserProfile = {
  phoneNumber: "",
  countryOfResidence: "",
  email: "",
  fullName: "",
  userName: "",
  profilePicture: "",
  kycVerified: false,
  gender: "",
  isProfileCreated: false,
  dateOfBirth: "",
  isEmailVerified: false,
};

export const useProfileStore = create<ProfileStore>((set) => ({
  userProfile: defaultUserProfile,
  email: "",

  setProfile: (profile) =>
    set(() => ({
      userProfile: profile,
    })),

  setEmail: (email) =>
    set(() => ({
      email,
    })),

  clearProfile: () =>
    set(() => ({
      userProfile: defaultUserProfile,
    })),
}));
