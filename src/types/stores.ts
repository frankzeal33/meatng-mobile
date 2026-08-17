export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
};

export type LoaderStore = {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
  setLoader: (isLoading: boolean) => void;
};

export type NetworkStore = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  setNetworkState: (
    isConnected: boolean | null,
    isInternetReachable: boolean | null,
  ) => void;
};

export type UserProfile = {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
};

export type ProfileStore = {
  userProfile: UserProfile;
  setProfile: (profile: UserProfile) => Promise<void>;
  clearProfile: () => Promise<void>;
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
