import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import RetryButton from "@/components/RetryButton";
import {
  SettingsHeader,
  SettingsScreenRoot,
} from "@/components/settings/SettingsShell";
import { axiosClient } from "@/globalApi";
import { useProfileStore } from "@/store/ProfileStore";
import type { PersonalInformationForm } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useToast } from "react-native-toast-notifications";
import z from "zod";

const personalInformationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string(),
  phoneNumber: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine(
      (value) =>
        value.startsWith("0") ? value.length === 11 : value.length === 10,
      {
        message:
          "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
      },
    ),
});

const formatProfileResponse = (
  response: any,
  fallback: PersonalInformationForm,
): PersonalInformationForm => {
  const attributes = response.data?.data?.attributes ?? {};
  return {
    firstName: attributes.first_name ?? fallback.firstName,
    lastName: attributes.last_name ?? fallback.lastName,
    email: attributes.email ?? fallback.email,
    phoneNumber: String(attributes.phone ?? fallback.phoneNumber),
  };
};

const PersonalInformationScreen = () => {
  const toast = useToast();
  const storedProfile = useProfileStore((state) => state.userProfile);
  const setProfile = useProfileStore((state) => state.setProfile);
  const [form, setForm] = useState<PersonalInformationForm>({
    firstName: storedProfile.firstName,
    lastName: storedProfile.lastName,
    email: storedProfile.email,
    phoneNumber: storedProfile.phoneNumber,
  });
  const [originalForm, setOriginalForm] =
    useState<PersonalInformationForm>(form);
  const [touched, setTouched] = useState<
    Partial<Record<keyof PersonalInformationForm, boolean>>
  >({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const validation = personalInformationSchema.safeParse(form);
  const errors = validation.success
    ? {}
    : validation.error.issues.reduce<
        Partial<Record<keyof PersonalInformationForm, string>>
      >((fieldErrors, issue) => {
        const field = issue.path[0] as keyof PersonalInformationForm;
        fieldErrors[field] ??= issue.message;
        return fieldErrors;
      }, {});

  const fieldError = (field: keyof PersonalInformationForm) =>
    touched[field] || hasSubmitted ? errors[field] : undefined;

  const touchField = (field: keyof PersonalInformationForm) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const updateField = (field: keyof PersonalInformationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const fetchProfile = useCallback(async () => {
    try {
      setInitialLoading(true);
      setLoadError(null);
      const response = await axiosClient.get("/users/me");
      const currentProfile = useProfileStore.getState().userProfile;
      const profile = formatProfileResponse(response, {
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName,
        email: currentProfile.email,
        phoneNumber: currentProfile.phoneNumber,
      });
      setForm(profile);
      setOriginalForm(profile);
    } catch (error: any) {
      const message =
        error.response?.data?.message ?? "Unable to load your profile.";
      setLoadError(message);
      toast.show(message, { type: "danger" });
    } finally {
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setHasSubmitted(true);
    if (!validation.success || isSubmitting) return;

    const currentValues = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email,
      phoneNumber: form.phoneNumber.trim(),
    };
    const originalValues = {
      firstName: originalForm.firstName.trim(),
      lastName: originalForm.lastName.trim(),
      email: originalForm.email,
      phoneNumber: originalForm.phoneNumber.trim(),
    };

    if (JSON.stringify(currentValues) === JSON.stringify(originalValues)) {
      toast.show("No changes detected.", { type: "warning" });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosClient.patch("/users/me", {
        first_name: validation.data.firstName,
        last_name: validation.data.lastName,
        phone: validation.data.phoneNumber,
      });
      const responseForm = formatProfileResponse(response, {
        ...form,
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        phoneNumber: validation.data.phoneNumber,
      });
      const updatedForm = {
        ...responseForm,
        phoneNumber: validation.data.phoneNumber,
      };

      setForm(updatedForm);
      setOriginalForm(updatedForm);
      setTouched({});
      setHasSubmitted(false);
      await setProfile({
        firstName: updatedForm.firstName,
        lastName: updatedForm.lastName,
        email: updatedForm.email,
        phoneNumber: updatedForm.phoneNumber,
        isEmailVerified: storedProfile.isEmailVerified,
      });

      toast.show("Profile updated successfully.", {
        type: "success",
      });

    } catch (error: any) {
      toast.show(
        error.response?.data?.message ?? "Unable to update your profile.",
        { type: "danger" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsScreenRoot>
      <SettingsHeader
        title="Personal Information"
        subtitle="Update your personal information."
      />
      {initialLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#218225" />
          <Text className="mt-2 font-mregular text-xs text-gray">
            Loading profile...
          </Text>
        </View>
      ) : loadError ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center font-mregular text-sm text-gray">
            {loadError}
          </Text>
          <RetryButton
            onPress={() => void fetchProfile()}
            containerStyles="mt-4"
          />
        </View>
      ) : (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-4 px-4 pb-5 pt-8"
        >
          <FormField
            title="First name"
            required
            value={form.firstName}
            placeholder="Adebola"
            handleChangeText={(value) => updateField("firstName", value)}
            onBlur={() => touchField("firstName")}
            error={fieldError("firstName")}
            autoCapitalize="words"
            autoComplete="given-name"
          />
          <FormField
            title="Last name"
            required
            value={form.lastName}
            placeholder="Okonkwo"
            handleChangeText={(value) => updateField("lastName", value)}
            onBlur={() => touchField("lastName")}
            error={fieldError("lastName")}
            autoCapitalize="words"
            autoComplete="family-name"
          />
          <FormField
            title="Email"
            required
            value={form.email}
            placeholder="you@example.com"
            disabled
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <FormField
            title="Phone Number"
            required
            value={form.phoneNumber}
            placeholder="08123456789"
            handleChangeText={(value) => updateField("phoneNumber", value)}
            onBlur={() => touchField("phoneNumber")}
            error={fieldError("phoneNumber")}
            keyboardType="phone-pad"
            maxLength={11}
            autoComplete="tel"
          />
          <CustomButton
            title={isSubmitting ? "Updating..." : "Save Changes"}
            handlePress={handleSave}
            containerStyles="mt-6 w-full"
            textStyles="text-white"
            isLoading={isSubmitting}
            disableButton={isSubmitting}
          />
        </ScrollView>
      )}
    </SettingsScreenRoot>
  );
};

export default PersonalInformationScreen;
