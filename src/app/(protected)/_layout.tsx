import { Stack } from "expo-router";

const ProtectedLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="(routes)/PersonalInformation" />
  </Stack>
);

export default ProtectedLayout;
