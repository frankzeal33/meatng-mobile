import type { ReferralStore } from "@/types/stores";
import { create } from "zustand";

export const useReferralStore = create<ReferralStore>((set) => ({
  refData: {
    invitees: 0,
    referralCode: "",
    totalEarned: 0,
  },

  setReferralInfo: (payload) =>
    set(() => ({
      refData: payload,
    })),

  referralLoading: true,

  setReferralLoading: (loading) => set({ referralLoading: loading }),
}));
