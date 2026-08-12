import { create } from 'zustand';

interface UserProfile {
  phoneNumber: string;
  countryOfResidence:  string;
  email:  string;
  fullName:  string;
  profilePicture:  string;
  kycVerified: boolean;
  gender:  string;
  dateOfBirth: string;
  isEmailVerified: boolean;
}

interface ProfileStore {
  userProfile: UserProfile;
  email: string;
  setProfile: (profile: UserProfile) => void;
  setEmail: (email: string) => void;
  clearProfile: () => void;
}

const defaultUserProfile: UserProfile = {
  phoneNumber: "",
  countryOfResidence: "",
  email: "",
  fullName: "",
  profilePicture: "",
  kycVerified: false,
  gender: "",
  dateOfBirth: "",
  isEmailVerified: false
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
