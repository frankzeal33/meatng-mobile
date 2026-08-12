import type { CatalogProduct } from "@/types/catalog";
import { toGrams } from "@/utils/conversion";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cartStateStorage } from "./mmkvStorage";
import { useSubscriptionStore } from "./subscriptionStore";

export type CartItem = CatalogProduct & {
  qty: number;
  item_type: "base";
  gram_weight: number;
};

export type CartActionResult = {
  success: boolean;
  message?: string;
};

type CartState = {
  items: CartItem[];
  maxItems: number;
  setMaxItems: (value: number) => void;
  add: (product: CatalogProduct, qty?: number) => CartActionResult;
  setQty: (product: CatalogProduct, qty: number) => CartActionResult;
  remove: (id: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalGramWeight: () => number;
  getProductWeight: (productId: string) => number;
  getCategoryWeight: (categoryId: string) => number;
};

function validateQuantity(
  product: CatalogProduct,
  quantity: number,
  items: CartItem[],
): CartActionResult {
  const attributes =
    useSubscriptionStore.getState().subInfo?.subscription?.attributes;

  if (!attributes) {
    return { success: false, message: "Please select a plan first." };
  }

  const productWeight = product.weightInGrams;
  const currentItem = items.find((item) => item.id === product.id);
  const currentItemWeight = currentItem
    ? currentItem.gram_weight * currentItem.qty
    : 0;
  const currentTotal = items.reduce(
    (total, item) => total + item.gram_weight * item.qty,
    0,
  );
  const nextTotal = currentTotal - currentItemWeight + productWeight * quantity;
  const maximumWeight = toGrams(
    attributes.remaining_weight ?? 0,
    attributes.weight_unit as "kg" | "g",
  );

  if (nextTotal > maximumWeight) {
    return { success: false, message: "Maximum weight exceeded." };
  }

  const productRule = attributes.product_rules?.find(
    (rule) => rule.product_id === product.id,
  );
  if (
    productRule &&
    productWeight * quantity >
      toGrams(productRule.max_weight, productRule.weight_unit)
  ) {
    return {
      success: false,
      message: `You have reached the limit for ${product.name}.`,
    };
  }

  const categoryRules = attributes.category_rules ?? [];
  if (categoryRules.length > 0) {
    const categoryRule = categoryRules.find(
      (rule) => rule.category_id === product.categoryId,
    );

    if (!categoryRule) {
      return {
        success: false,
        message: "Please select products from the required category.",
      };
    }

    const currentCategoryWeight = items
      .filter((item) => item.categoryId === product.categoryId)
      .reduce((total, item) => total + item.gram_weight * item.qty, 0);
    const nextCategoryWeight =
      currentCategoryWeight - currentItemWeight + productWeight * quantity;

    if (
      nextCategoryWeight >
      toGrams(categoryRule.weight_required, categoryRule.weight_unit)
    ) {
      return {
        success: false,
        message: `You have reached the limit for ${product.category}.`,
      };
    }
  }

  return { success: true };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 0,
      setMaxItems: (value) => set({ maxItems: value }),
      add: (product, qty = 1) => {
        const currentItem = get().items.find((item) => item.id === product.id);
        return get().setQty(product, (currentItem?.qty ?? 0) + qty);
      },
      setQty: (product, qty) => {
        if (qty <= 0) {
          get().remove(product.id);
          return { success: true };
        }

        const result = validateQuantity(product, qty, get().items);
        if (!result.success) return result;

        const existing = get().items.find((item) => item.id === product.id);
        const gramWeight = product.weightInGrams;

        set({
          items: existing
            ? get().items.map((item) =>
                item.id === product.id ? { ...item, ...product, qty } : item,
              )
            : [
                ...get().items,
                {
                  ...product,
                  qty,
                  item_type: "base",
                  gram_weight: gramWeight,
                },
              ],
        });
        return { success: true };
      },
      remove: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      clearCart: () => set({ items: [] }),
      totalItems: () =>
        get().items.reduce((total, item) => total + item.qty, 0),
      totalGramWeight: () =>
        get().items.reduce(
          (total, item) => total + item.gram_weight * item.qty,
          0,
        ),
      getProductWeight: (productId) =>
        get()
          .items.filter((item) => item.id === productId)
          .reduce((total, item) => total + item.gram_weight * item.qty, 0),
      getCategoryWeight: (categoryId) =>
        get()
          .items.filter((item) => item.categoryId === categoryId)
          .reduce((total, item) => total + item.gram_weight * item.qty, 0),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => cartStateStorage),
    },
  ),
);
