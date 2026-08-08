import type MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ImageSource } from "expo-image";
import type { ComponentProps } from "react";

export type PlanType = {
  id: string;
  name: string;
  type: "Custom" | "Standard";
  description: string;
  price: string;
  weight: string;
  breakdown: string;
  image: ImageSource;
};

export type PlanCardProps = {
  plan: PlanType;
  onSelect: (plan: PlanType) => void;
};

export type PreBuiltItemType = {
  id: string;
  name: string;
  weight: string;
  quantity: number;
  image: ImageSource;
};

export type AppIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type OverviewCardProps = {
  icon: AppIconName;
  label: string;
  value: string;
};

export type GreenIconProps = {
  icon: AppIconName;
  size?: number;
};

export type SubscriptionDetailProps = {
  icon: AppIconName;
  label: string;
  value: string;
};

export type ReferralStat = {
  id: string;
  icon: AppIconName;
  label: string;
  value: string;
};

export type ReferralStatCardProps = {
  item: ReferralStat;
};

export type ReferralActionButtonProps = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
};

export type ReferralHistoryItem = {
  id: string;
  name: string;
  date: string;
  status: "Pending" | "Completed" | "Rewarded";
  reward: string;
};

export type ReferralHistoryListItemProps = {
  item: ReferralHistoryItem;
};
