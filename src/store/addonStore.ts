import type { CatalogProduct } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cartStateStorage } from "./mmkvStorage";

export type AddonItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  qty: number;
  item_type: "addon";
};

type AddonState = {
  addonItems: AddonItem[];
  maxAddonItems: number;

  setMaxAddonItems: (value: number) => void;

  addAddon: (product: CatalogProduct, qty?: number) => void;
  setAddonQty: (product: { id: string }, qty: number) => void;
  removeAddon: (id: string) => void;
  clearAddon: () => void;

  totalAddonItems: () => number;
  totalAddonPrice: () => number;
};

export const useAddonStore = create<AddonState>()(
  persist(
    (set, get) => ({
      addonItems: [],
      maxAddonItems: 0,

      setMaxAddonItems: (value) => set({ maxAddonItems: value }),

      addAddon: (product, qty = 1) => {
        const items = get().addonItems;

        const existing = items.find((i) => i.id === product.id);

        if (existing) {
          set({
            addonItems: items.map((i) =>
              i.id === product.id
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          });
        } else {
          set({
            addonItems: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.priceValue ?? 0,
                image: typeof product.image === "string" ? product.image : "",
                weight: product.weight ?? 0,
                weight_unit: product.weightUnit ?? "g",
                category: product.category,
                qty,
                item_type: "addon",
              },
            ],
          });
        }
      },

      setAddonQty: (product, qty) => {
        if (qty <= 0) {
          set({
            addonItems: get().addonItems.filter((i) => i.id !== product.id),
          });
          return;
        }

        set({
          addonItems: get().addonItems.map((i) =>
            i.id === product.id ? { ...i, qty } : i
          ),
        });
      },

      removeAddon: (id) =>
        set({
          addonItems: get().addonItems.filter((i) => i.id !== id),
        }),

      clearAddon: () => set({ addonItems: [] }),

      totalAddonItems: () =>
        get().addonItems.reduce((acc, item) => acc + item.qty, 0),

      totalAddonPrice: () =>
        get().addonItems.reduce(
          (acc, item) => acc + item.price * item.qty,
          0
        ),
    }),
    {
      name: "cart-addon",
      storage: createJSONStorage(() => cartStateStorage),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AddonState>;

        return {
          ...state,
          addonItems: (state.addonItems ?? []).map((item) => ({
            ...item,
            item_type: "addon" as const,
          })),
        };
      },
    }
  )
);
