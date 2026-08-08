import type { ImageSource } from "expo-image";

export type GiftScreenProps = {
  variant?: "onboarding" | "tab";
};

export type GiftBox = {
  id: string;
  name: string;
  description: string;
  weight: string;
  price: string;
  image: ImageSource;
  includedCuts: GiftIncludedCut[];
};

export type GiftIncludedCut = {
  id: string;
  name: string;
  quantity: string;
};

export type GiftBoxCardProps = {
  item: GiftBox;
  onSelect: (giftBox: GiftBox) => void;
};

export type GiftBoxListItemProps = {
  item: GiftBox;
};

export type GiftIncludedCutListItemProps = {
  item: GiftIncludedCut;
};

export type GiftRecipientForm = {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  occasion: string;
  deliveryDate: string;
  deliveryWindow: string;
  giftNote: string;
};

export type GiftRecipientRouteParams = {
  giftId?: string;
  giftName?: string;
  weight?: string;
  price?: string;
  includedCuts?: string;
};

export type GiftCheckoutRouteParams = GiftRecipientRouteParams & {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  occasion?: string;
  deliveryDate?: string;
  deliveryWindow?: string;
  giftNote?: string;
};

export type GiftCheckoutForm = {
  savedAddress: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  isDefaultAddress: boolean;
  deliveryArea: string;
  streetAddress: string;
  apartment: string;
  zipCode: string;
  deliveryNote: string;
};
