export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
};

export type UserProfile = {
  phoneNumber: string;
  countryOfResidence: string;
  email: string;
  fullName: string;
  profilePicture: string;
  userName: string;
  kycVerified: boolean;
  gender: string;
  isProfileCreated: boolean;
  dateOfBirth: string;
  isEmailVerified: boolean;
};

export type ProfileStore = {
  userProfile: UserProfile;
  email: string;
  setProfile: (profile: UserProfile) => void;
  setEmail: (email: string) => void;
  clearProfile: () => void;
};

export type RefData = {
  invitees: number;
  referralCode: string;
  totalEarned: number;
};

export type ReferralStore = {
  refData: RefData;
  setReferralInfo: (payload: RefData) => void;
  referralLoading: boolean;
  setReferralLoading: (payload: boolean) => void;
};
