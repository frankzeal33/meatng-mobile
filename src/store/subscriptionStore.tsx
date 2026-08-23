import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CategoryRule = {
  category_id: string;
  category_name: string;
  label: string;
  weight_required: number;
  weight_unit: "kg" | "g";
}

export type ProductRule = {
  product_id: string;
  product_name: string;
  label: string;
  max_weight: number;
  weight_unit: "kg" | "g";
}

export type PrefilledItem = {
  product_id: string;
  name: string;
  weight: number;
  weight_unit: string;
  quantity: number;
  image_url?: string;
};

export type PlanAttributes = {
  name: string;
  description: string;
  price: number;
  max_items: number;
  weight: number;
  weight_unit: string;
  is_active: boolean;
  is_featured?: boolean;
  plan_type: string;
  pricing_model: string;
  category_rules: CategoryRule[];
  product_rules: ProductRule[];
  prefilled_items: PrefilledItem[];
  prefilled_items_total_weight: number;
  remaining_weight: number;
  highlights?: string[];
  image: string;
  image_public_id: string;
  createdAt: string;
  updatedAt: string;
}

export type Plan = {
  type: "plans";
  id: string;
  attributes: PlanAttributes;
  links: {
    self: string;
  };
} | null

type SubscriptionInfo = {
  subscription: Plan;
  selectedFrequency: string;
  source: "onboarding" | "tab";
};

type SubscriptionStore = {
  subInfo: SubscriptionInfo | null;
  setSubInfo: (info: SubscriptionInfo) => void;
  clearSubInfo: () => void;
};

const defaultSubInfo: SubscriptionInfo = {
  subscription: null,
  selectedFrequency: "",
  source: "onboarding",
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subInfo: defaultSubInfo,
      setSubInfo: (info) => set({ subInfo: info }),
      clearSubInfo: () => set({ subInfo: defaultSubInfo }),
    }),
    {
      name: "subscription",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
