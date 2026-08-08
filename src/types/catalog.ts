import type { ImageSource } from "expo-image";

export type ProductCategory = "Chicken" | "Beef" | "Offal";

export type CategoryFilter = "All" | ProductCategory;

export type CatalogProduct = {
  id: string;
  name: string;
  weightLabel: string;
  weightInGrams: number;
  category: ProductCategory;
  price: string;
  stock: number;
  image: ImageSource;
};

export type CatalogCategoriesProps = {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
};

export type CatalogProductCardProps = {
  item: CatalogProduct;
  quantity: number;
  canIncrement?: boolean;
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
