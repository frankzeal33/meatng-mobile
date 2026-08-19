import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_COMPLETED_KEY = "onboarding-completed";

export const hasCompletedOnboarding = async () =>
  (await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)) === "true";

export const completeOnboarding = async () => {
  await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
};
