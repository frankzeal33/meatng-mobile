import { toGrams } from "@/utils/conversion";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AddonItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: number;
  weight_unit: string;
  category: string;
  qty: number;
  item_type: "addon" | "base";
};

type AddonState = {
  giftItems: AddonItem[];
  maxGiftItems: number;

  setMaxGiftItems: (value: number) => void;

  addGift: (product: any, qty?: number, item_type?: "base" | "addon") => void;
  setGiftQty: (product: any, qty: number) => void;
  removeGift: (id: string) => void;
  clearGift: () => void;

  totalItems: () => number;
  totalPrice: () => number;
};

export const useGiftStore = create<AddonState>()(
  persist(
    (set, get) => ({
      giftItems: [],
      maxGiftItems: 0,

      setMaxGiftItems: (value) => set({ maxGiftItems: value }),

      addGift: (product, qty = 1, item_type = "addon") => {
        const items = get().giftItems;

        const existing = items.find(
          (i) => i.id === product.id && i.item_type === item_type
        );

        if (existing) {
          set({
            giftItems: items.map((i) =>
              i.id === product.id && i.item_type === item_type
                ? { ...i, qty: i.qty + qty }
                : i
            ),
          });
        } else {
          set({
            giftItems: [
              ...items,
              {
                ...product,
                qty,
                item_type,
              },
            ],
          });
        }
      },

      setGiftQty: (product, qty) => {
        if (qty <= 0) {
          set({
            giftItems: get().giftItems.filter((i) => i.id !== product.id),
          });
          return;
        }

        set({
          giftItems: get().giftItems.map((i) =>
            i.id === product.id ? { ...i, qty } : i
          ),
        });
      },

      removeGift: (id) =>
        set({
          giftItems: get().giftItems.filter((i) => i.id !== id),
        }),

      clearGift: () => set({ giftItems: [] }),

      totalItems: () =>
        get().giftItems.reduce((acc, item) => acc + item.qty, 0),

      totalPrice: () =>
        get().giftItems.reduce(
          (acc, item) => acc + item.price * item.qty,
          0
        ),
    }),
    {
      name: "cart-gift",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
