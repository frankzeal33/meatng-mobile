import type { ImageSource } from "expo-image";

export type ProductCategory = string;

export type CategoryFilter = string;

export type CatalogCategoryOption = {
  id: string;
  name: string;
  value: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  weightLabel: string;
  weightInGrams: number;
  weight?: number;
  weightUnit?: "kg" | "g";
  category: ProductCategory;
  categoryId?: string;
  categorySlug?: string;
  price: string;
  priceValue?: number;
  stock: number;
  isActive?: boolean;
  image: ImageSource | string;
};

export type CatalogCategoriesProps = {
  activeCategory: CategoryFilter;
  categories?: CatalogCategoryOption[];
  onCategoryChange: (category: CategoryFilter) => void;
};

export type CatalogProductCardProps = {
  item: CatalogProduct;
  quantity: number;
  categoryBackgroundColor?: string;
  categoryTextColor?: string;
  canIncrement?: boolean;
  highlightWhenSelected?: boolean;
  onDecrement: (item: CatalogProduct) => void;
  onIncrement: (item: CatalogProduct) => void;
};

export type AddOnCategoriesProps = CatalogCategoriesProps;

export type StickyControlsProps = CatalogCategoriesProps & {
  progressPercent: number;
  remainingWeight: number;
  selectedWeight: number;
};

export type QuantityControlProps = {
  item: CatalogProduct;
  quantity: number;
  canIncrement?: boolean;
  onDecrement: (item: CatalogProduct) => void;
  onIncrement: (item: CatalogProduct) => void;
};

export type EditableProductRowProps = QuantityControlProps & {
  detail: string;
};

export type CatalogProductListItemProps = {
  item: CatalogProduct;
};
