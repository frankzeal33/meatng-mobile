import type { PlanType, PreBuiltItemType } from "@/types/general";
import type { ImageSource } from "expo-image";
import type { Animated } from "react-native";

export type DeliveryFrequency = {
  id: "weekly" | "bi-weekly" | "monthly";
  title: string;
  description: string;
  billing: string;
};

export type OnboardingSlide = {
  id: string;
  image: ImageSource;
  titleAccent: string;
  titleRest: string;
  description: string;
};

export type OnboardingSlideViewProps = OnboardingSlide & {
  currentIndex: number;
  skipOpacity: Animated.Value;
  onGetStarted: () => void;
  onGoToSlide: (index: number) => void;
  onSkip: () => void;
};

export type PlanListItemProps = {
  item: PlanType;
};

export type DeliveryFrequencyListItemProps = {
  item: DeliveryFrequency;
};

export type PreBuiltCardProps = {
  item: PreBuiltItemType;
};

export type AddOnsRouteParams = {
  boxSelections?: string;
};

export type ReviewCartRouteParams = AddOnsRouteParams & {
  addOnSelections?: string;
};

export type CheckoutRouteParams = ReviewCartRouteParams & {
  addOnsPrice?: string;
  total?: string;
};

export type AuthEmailRouteParams = {
  email?: string;
};

export type PlansScreenProps = {
  variant?: "onboarding" | "tab";
};
