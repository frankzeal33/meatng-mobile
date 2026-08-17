import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import DatePickerField from "@/components/DatePickerField";
import FormField from "@/components/FormField";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import type { GiftRecipientForm, GiftRecipientRouteParams } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "react-native-toast-notifications";
import { z } from "zod";

const recipientSchema = z.object({
  recipientName: z.string().trim().min(2, "Recipient name is required"),
  recipientPhone: z
    .string()
    .trim()
    .min(1, "Recipient phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits")
    .refine(
      (value) =>
        value.startsWith("0") ? value.length === 11 : value.length === 10,
      {
        message:
          "Phone number must be 11 digits if it starts with 0, otherwise 10 digits",
      },
    ),
  recipientEmail: z.union([
    z.literal(""),
    z.email("Enter a valid recipient email"),
  ]),
  occasion: z.string().trim().min(1, "Occasion is required"),
  deliveryDate: z.date("Preferred delivery date is required"),
  deliveryWindow: z
    .string()
    .trim()
    .min(1, "Preferred delivery window is required"),
  giftNote: z
    .string()
    .max(240, "Gift note cannot exceed 240 characters"),
  giftId: z.string().trim().min(1, "Please select a gift box"),
});

type RecipientField = keyof GiftRecipientForm;

const occasions = [
  "Birthday",
  "Anniversary",
  "Wedding Gift",
  "Holiday Hosting",
  "Thank You",
  "Corporate Appreciation",
];
const deliveryWindows = ["8 AM - 12 PM", "12 PM - 4 PM", "4 PM - 8 PM"];

export default function RecipientInformationScreen() {
  const params = useLocalSearchParams<GiftRecipientRouteParams>();
  const toast = useToast();
  const confirmationModalRef = useRef<BottomSheetModal>(null);
  const occasionModalRef = useRef<BottomSheetModal>(null);
  const deliveryWindowModalRef = useRef<BottomSheetModal>(null);
  const pendingGiftCheckoutRef = useRef(false);
  const confirmationSnapPoints = useMemo(() => ["92%"], []);
  const optionSnapPoints = useMemo(() => ["75%"], []);
  const [form, setForm] = useState<GiftRecipientForm>({
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    occasion: occasions[0],
    deliveryDate: null,
    deliveryWindow: deliveryWindows[0],
    giftNote: "",
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [touched, setTouched] = useState<
    Partial<Record<RecipientField, boolean>>
  >({});

  const validation = recipientSchema.safeParse({
    ...form,
    giftId: params.giftId ?? "",
  });
  const errors: Partial<Record<RecipientField | "giftId", string>> = {};
  if (!validation.success) {
    validation.error.issues.forEach((issue) => {
      const field = issue.path[0] as RecipientField | "giftId";
      errors[field] ??= issue.message;
    });
  }

  const fieldError = (field: RecipientField) =>
    hasSubmitted || touched[field] ? errors[field] : undefined;

  const touchField = (field: RecipientField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const updateField = <K extends keyof GiftRecipientForm>(
    field: K,
    value: GiftRecipientForm[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const selectOccasion = (occasion: string) => {
    touchField("occasion");
    updateField("occasion", occasion);
    occasionModalRef.current?.dismiss();
  };

  const selectDeliveryWindow = (deliveryWindow: string) => {
    touchField("deliveryWindow");
    updateField("deliveryWindow", deliveryWindow);
    deliveryWindowModalRef.current?.dismiss();
  };

  const selectDeliveryDate = (selectedDate: Date) => {
    touchField("deliveryDate");
    updateField("deliveryDate", selectedDate);
  };

  const handleContinue = () => {
    setHasSubmitted(true);
    if (!validation.success) {
      if (errors.giftId) {
        toast.show(errors.giftId, { type: "danger" });
      }
      return;
    }
    confirmationModalRef.current?.present();
  };

  const handleCloseConfirmation = () => {
    confirmationModalRef.current?.dismiss();
  };

  const handleConfirmContinue = () => {
    pendingGiftCheckoutRef.current = true;
    confirmationModalRef.current?.dismiss();
  };

  const handleConfirmationDismiss = () => {
    if (!pendingGiftCheckoutRef.current) {
      return;
    }

    pendingGiftCheckoutRef.current = false;
    router.push({
      pathname: "/(onboarding)/GiftCheckout",
      params: {
        giftId: params.giftId ?? "",
        giftName: params.giftName ?? "",
        weight: params.weight ?? "",
        price: params.price ?? "",
        includedCuts: params.includedCuts ?? "",
        recipientName: form.recipientName,
        recipientPhone: form.recipientPhone,
        recipientEmail: form.recipientEmail,
        occasion: form.occasion,
        deliveryDate: form.deliveryDate?.toISOString().split("T")[0] ?? "",
        deliveryWindow: form.deliveryWindow,
        giftNote: form.giftNote,
      },
    });
  };

  const dropdownIcon = (
    <Ionicons name="chevron-down" size={22} color="#929292" />
  );

  return (
    <SafeAreaView
      className="bg-background"
      edges={["top", "bottom"]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <StatusBar style="dark" />

        <View className="px-4">
          <SpaceBetweenHeader
            onBackPress={() => router.back()}
            showRight={false}
          />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 20,
          }}
        >
          <Text className="font-mbold text-2xl">Recipient Information</Text>

          <View className="mt-4 gap-4">
            <FormField
              title="Recipient Name"
              required
              value={form.recipientName}
              placeholder="Who is receiving this?"
              handleChangeText={(value) => updateField("recipientName", value)}
              autoCapitalize="words"
              onBlur={() => touchField("recipientName")}
              error={fieldError("recipientName")}
            />

            <FormField
              title="Recipient Phone Number"
              required
              value={form.recipientPhone}
              placeholder="For delivery coordination"
              handleChangeText={(value) => updateField("recipientPhone", value)}
              keyboardType="phone-pad"
              maxLength={11}
              onBlur={() => touchField("recipientPhone")}
              error={fieldError("recipientPhone")}
            />

            <FormField
              title="Recipient Email"
              value={form.recipientEmail}
              placeholder="Recipient email"
              handleChangeText={(value) => updateField("recipientEmail", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={() => touchField("recipientEmail")}
              error={fieldError("recipientEmail")}
              optional
            />

            <FormField
              title="Occasion"
              required
              value={form.occasion}
              placeholder="Birthday"
              onPress={() => occasionModalRef.current?.present()}
              rightElement={dropdownIcon}
              error={fieldError("occasion")}
            />

            <DatePickerField
              title="Preferred Delivery Date"
              required
              value={form.deliveryDate}
              placeholder="Select delivery date"
              minimumDate={new Date()}
              onChange={selectDeliveryDate}
              error={fieldError("deliveryDate")}
            />

            <FormField
              title="Preferred Delivery Window"
              required
              value={form.deliveryWindow}
              placeholder="8 AM - 12 PM"
              onPress={() => deliveryWindowModalRef.current?.present()}
              rightElement={dropdownIcon}
              error={fieldError("deliveryWindow")}
            />

            <View>
              <TextArea
                title="Gift Note"
                value={form.giftNote}
                placeholder="Write a short gift note for the recipient"
                handleChangeText={(value) => updateField("giftNote", value)}
                maxLength={240}
              />
              <Text className="mt-2 text-right font-mregular text-sm text-gray">
                {form.giftNote.length}/240 characters
              </Text>
              {fieldError("giftNote") ? (
                <Text className="mt-1 font-mregular text-sm text-red-600">
                  {fieldError("giftNote")}
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>

        <View className="px-4">
          <CustomButton
            title="Continue"
            handlePress={handleContinue}
            containerStyles="mb-1 mt-2 w-full"
            textStyles="text-white"
          />
        </View>
      </KeyboardAvoidingView>

      <CustomButtomSheet
        ref={occasionModalRef}
        snapPoints={optionSnapPoints}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <Text className="font-mbold text-2xl">Select occasion</Text>
          <Text className="mb-4 mt-1 font-mregular text-sm text-gray">
            What are you celebrating?
          </Text>
          <BottomSheetFlatList
            data={occasions}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const selected = form.occasion === item;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => selectOccasion(item)}
                  className={`flex-row items-center justify-between rounded-xl border px-4 py-4 active:opacity-70 ${
                    selected
                      ? "border-green bg-green-lighter"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text className="font-msbold text-base">{item}</Text>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#218225"
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </CustomButtomSheet>

      <CustomButtomSheet
        ref={deliveryWindowModalRef}
        snapPoints={optionSnapPoints}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <Text className="font-mbold text-2xl">Select delivery window</Text>
          <Text className="mb-4 mt-1 font-mregular text-sm text-gray">
            Choose the preferred delivery time.
          </Text>
          <BottomSheetFlatList
            data={deliveryWindows}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            renderItem={({ item }) => {
              const selected = form.deliveryWindow === item;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => selectDeliveryWindow(item)}
                  className={`flex-row items-center justify-between rounded-xl border px-4 py-4 active:opacity-70 ${
                    selected
                      ? "border-green bg-green-lighter"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="time-outline" size={20} color="#218225" />
                    <Text className="font-msbold text-base">{item}</Text>
                  </View>
                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#218225"
                    />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </CustomButtomSheet>

      <CustomButtomSheet
        ref={confirmationModalRef}
        snapPoints={confirmationSnapPoints}
        onDismiss={handleConfirmationDismiss}
        enablePenDown={false}
        dynamicSizing={false}
        scrollable
      >
        <View className="h-full">
          <Pressable
            onPress={handleCloseConfirmation}
            className="mb-3 size-12 items-center justify-center rounded-full bg-green-light"
          >
            <Ionicons name="arrow-back" size={22} color="#218225" />
          </Pressable>

          <BottomSheetScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text className="my-4 font-mbold text-2xl">
              Recipient Information
            </Text>

            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Gift type"
                value={params.giftName || "—"}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Price"
                value={params.price || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
                valueStyles="font-msbold text-green"
              />
            </View>

            <View className="mt-4 rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Recipient name"
                value={form.recipientName || "—"}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Phone number"
                value={form.recipientPhone || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
              />
              {form.recipientEmail && (
                <SpaceBetween
                  title="Email"
                  value={form.recipientEmail}
                  containerStyles="mt-4"
                  titleStyles="text-gray"
                />
              )}
              <SpaceBetween
                title="Occassion"
                value={form.occasion || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Delivery date"
                value={form.deliveryDate ? format(form.deliveryDate, "do MMM yyyy") : "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
                valueStyles="font-msbold text-green"
              />
              <SpaceBetween
                title="Delivery window"
                value={form.deliveryWindow || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
              />
            </View>

            <View className="mt-4 w-full rounded-2xl bg-white p-4">
              <Text className="font-msbold text-base">Gift note</Text>
              <Text className="mt-2 font-mregular text-base text-gray">
                {form.giftNote || "No gift note added."}
              </Text>
            </View>

            <Text className="mt-5 font-mregular text-xs text-gray">
              Gift orders checkout through the one-time order flow. You can add
              regular products before payment.
            </Text>
          </BottomSheetScrollView>

          <CustomButton
            title="Continue"
            handlePress={handleConfirmContinue}
            containerStyles="mb-2 mt-3 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>
    </SafeAreaView>
  );
}
