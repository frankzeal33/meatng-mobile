import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CategoryRule = {
  category_id: string;
  category_name: string;
  label: string;
  weight_required: number;
  weight_unit: "kg" | "g";
};

export type ProductRule = {
  product_id: string;
  product_name: string;
  label: string;
  max_weight: number;
  weight_unit: "kg" | "g";
};

export type GiftPlanAttributes = {
  name: string;
  description: string;
  price: number;
  max_items: number;
  weight: number;
  weight_unit: string;
  is_active: boolean;
  plan_type: string;
  pricing_model: string;
  category_rules: CategoryRule[];
  product_rules: ProductRule[];
  prefilled_items: any[];
  prefilled_items_total_weight: number;
  remaining_weight: number;
  image: string;
  image_public_id: string;
  createdAt: string;
  updatedAt: string;
};

export type GiftPlan = {
  type: "plans";
  id: string;
  attributes: GiftPlanAttributes;
  links: {
    self: string;
  };
};

type GiftPlanInfo = {
  giftPlan: GiftPlan | null;
};

type GiftPlanStore = {
  giftPlanInfo: GiftPlanInfo;
  setGiftPlanInfo: (info: GiftPlanInfo) => void;
  clearGiftPlanInfo: () => void;
};

const defaultGiftPlanInfo: GiftPlanInfo = {
  giftPlan: null,
};

export const useGiftPlanStore = create<GiftPlanStore>()(
  persist(
    (set) => ({
      giftPlanInfo: defaultGiftPlanInfo,

      setGiftPlanInfo: (info) => set({ giftPlanInfo: info }),

      clearGiftPlanInfo: () => set({ giftPlanInfo: defaultGiftPlanInfo }),
    }),
    {
      name: "gift-plan",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
