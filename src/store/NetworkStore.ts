import type { NetworkStore } from "@/types/stores";
import { create } from "zustand";

export const useNetworkStore = create<NetworkStore>((set) => ({
  isConnected: null,
  isInternetReachable: null,
  setNetworkState: (isConnected, isInternetReachable) =>
    set({ isConnected, isInternetReachable }),
}));

export const getNetworkState = () => useNetworkStore.getState();
