import type { LoaderStore } from "@/types/stores";
import { create } from "zustand";

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  showLoader: () => set({ isLoading: true }),
  hideLoader: () => set({ isLoading: false }),
  setLoader: (isLoading) => set({ isLoading }),
}));

export const useIsLoading = () =>
  useLoaderStore((state) => state.isLoading);

export const showLoader = () => useLoaderStore.getState().showLoader();

export const hideLoader = () => useLoaderStore.getState().hideLoader();

export const setLoader = (isLoading: boolean) =>
  useLoaderStore.getState().setLoader(isLoading);
