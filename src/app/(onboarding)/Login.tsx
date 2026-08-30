import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import { axiosClient } from "@/globalApi";
import { useAuthStore } from "@/store/AuthStore";
import {
  hideLoader,
  showLoader,
  useIsLoading,
} from "@/store/LoaderStore";
import { useProfileStore } from "@/store/ProfileStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import z from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .pipe(z.email({ error: "Enter a valid email address" })),
  password: z.string().min(2, "Enter a valid password"),
});

type LoginForm = z.input<typeof loginSchema>;
type LoginField = keyof LoginForm;
const rememberedEmailKey = "rememberedLoginEmail";

export default function Login() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isLoading = useIsLoading();
  const login = useAuthStore((state) => state.login);
  const setProfile = useProfileStore((state) => state.setProfile);
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [touched, setTouched] = useState<
    Partial<Record<LoginField, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const rememberedEmail = await AsyncStorage.getItem(rememberedEmailKey);
        if (!rememberedEmail) return;

        setForm((current) =>
          current.email ? current : { ...current, email: rememberedEmail },
        );
      } catch {
        // Remembering the email is optional and must not block sign-in.
      }
    };

    void loadRememberedEmail();
  }, []);

  const validation = loginSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<Partial<Record<LoginField, string>>>(
        (fieldErrors, issue) => {
          const field = issue.path[0] as LoginField;
          fieldErrors[field] ??= issue.message;
          return fieldErrors;
        },
        {},
      );

  function fieldError(field: LoginField) {
    return touched[field] || hasSubmitted ? errors[field] : undefined;
  }

  function touchField(field: LoginField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function updateField(field: LoginField, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const handleLogin = async () => {
    setHasSubmitted(true);
    if (!validation.success || isLoading) return;

    try {
      showLoader();

      const response = await axiosClient.post(
        "/auth/login",
        validation.data,
      );
      const attributes = response.data?.data?.attributes;

      const accessToken = attributes?.token?.accessToken
      const refreshToken = attributes?.token?.refreshToken

      const user = {
        phoneNumber: attributes?.user?.phone || "",
        email: attributes?.user?.email || "",
        firstName: attributes?.user?.first_name || "",
        lastName: attributes?.user?.last_name || "",
        isEmailVerified: attributes?.user?.is_email_verified ?? false
      }
      await setProfile(user);

      if (accessToken) {
        await login(accessToken, refreshToken);
      }

      const rememberedEmail = user.email || validation.data.email;
      await AsyncStorage.setItem(rememberedEmailKey, rememberedEmail);

      toast.show("Login successful", {
        type: "success",
      });

      router.replace("/(protected)/(tabs)/Home")

      setForm({ email: rememberedEmail, password: "" })
    } catch (error: any) {
      const message = error.response?.data?.message

      if (message === "Please verify your email before signing in") {
        router.push({
          pathname: "/(onboarding)/RegisterOTP",
          params: { email: validation.data.email },
        })
      }else{
        toast.show(message ?? "Unable to sign in. Please try again.", {
          type: "danger",
        });
      }

    } finally {
      hideLoader();
    }
  }

  return (
    <SafeAreaView className="bg-background" edges={["top"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 28,
          }}
        >
          <SpaceBetweenHeader
            onBackPress={() => router.back()}
            showRight={false}
          />

          <View className="mt-2">
            <Text className="font-mbold text-2xl">Welcome back!</Text>
            <Text className="font-mregular text-base text-gray">
              Sign in to MeatNG. Access your delivery schedule, plan controls,
              and order history.
            </Text>
          </View>

          <View className="mt-4 gap-5">
            <FormField
              title="Email Address"
              value={form.email}
              placeholder="you@example.com"
              handleChangeText={(value) => updateField("email", value)}
              onBlur={() => touchField("email")}
              error={fieldError("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <FormField
              title="Password"
              value={form.password}
              placeholder="Min. 8 characters"
              handleChangeText={(value) => updateField("password", value)}
              onBlur={() => touchField("password")}
              error={fieldError("password")}
              isPassword
              autoCapitalize="none"
              autoComplete="current-password"
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(onboarding)/ForgotPassword")}
            className="mt-6 self-end active:opacity-70"
          >
            <Text className="font-msbold text-base text-green">
              Forgot Password?
            </Text>
          </Pressable>

          <CustomButton
            title="Login"
            handlePress={handleLogin}
            disableButton={isLoading}
            containerStyles="mt-6"
            textStyles="text-white"
          />

          <View
            className="mt-4 flex-row items-center justify-center"
            style={{ paddingBottom: insets.bottom }}
          >
            <Text className="font-mregular text-base">Not a member yet? </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/(onboarding)/Register")}
              className="active:opacity-70"
            >
              <Text className="font-msbold text-base text-green">Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
