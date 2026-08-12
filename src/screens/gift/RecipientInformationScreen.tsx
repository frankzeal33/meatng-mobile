import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import type { GiftRecipientForm, GiftRecipientRouteParams } from "@/types/gift";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
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

const occasions = [
  "Birthday",
  "Anniversary",
  "Thank You",
  "Congratulations",
  "Other",
];
const deliveryDates = ["15/08/2026", "22/08/2026", "29/08/2026"];
const deliveryWindows = ["8 AM - 12 PM", "12 PM - 4 PM", "4 PM - 7 PM"];

function nextOption(options: string[], current: string) {
  const currentIndex = options.indexOf(current);
  return options[(currentIndex + 1) % options.length];
}

export default function RecipientInformationScreen() {
  const params = useLocalSearchParams<GiftRecipientRouteParams>();
  const confirmationModalRef = useRef<BottomSheetModal>(null);
  const pendingGiftCheckoutRef = useRef(false);
  const confirmationSnapPoints = useMemo(() => ["92%"], []);
  const [form, setForm] = useState<GiftRecipientForm>({
    recipientName: "",
    recipientPhone: "",
    recipientEmail: "",
    occasion: occasions[0],
    deliveryDate: "",
    deliveryWindow: deliveryWindows[0],
    giftNote: "",
  });

  const updateField = (field: keyof GiftRecipientForm, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const selectNextOccasion = () => {
    setForm((current) => ({
      ...current,
      occasion: nextOption(occasions, current.occasion),
    }));
  };

  const selectNextDeliveryDate = () => {
    setForm((current) => ({
      ...current,
      deliveryDate: current.deliveryDate
        ? nextOption(deliveryDates, current.deliveryDate)
        : deliveryDates[0],
    }));
  };

  const selectNextDeliveryWindow = () => {
    setForm((current) => ({
      ...current,
      deliveryWindow: nextOption(deliveryWindows, current.deliveryWindow),
    }));
  };

  const handleContinue = () => {
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
        deliveryDate: form.deliveryDate,
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
              value={form.recipientName}
              placeholder="Who is receiving this?"
              handleChangeText={(value) => updateField("recipientName", value)}
              autoCapitalize="words"
            />

            <FormField
              title="Recipient Phone Number"
              value={form.recipientPhone}
              placeholder="For delivery coordination"
              handleChangeText={(value) => updateField("recipientPhone", value)}
              keyboardType="phone-pad"
            />

            <FormField
              title="Recipient Email"
              value={form.recipientEmail}
              placeholder="Recipient email"
              handleChangeText={(value) => updateField("recipientEmail", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <FormField
              title="Occasion"
              value={form.occasion}
              placeholder="Birthday"
              onPress={selectNextOccasion}
              rightElement={dropdownIcon}
            />

            <FormField
              title="Preferred Delivery Date"
              value={form.deliveryDate}
              placeholder="dd/mm/yyyy"
              onPress={selectNextDeliveryDate}
              rightElement={dropdownIcon}
            />

            <FormField
              title="Preferred Delivery Window"
              value={form.deliveryWindow}
              placeholder="8 AM - 12 PM"
              onPress={selectNextDeliveryWindow}
              rightElement={dropdownIcon}
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
              <SpaceBetween
                title="Occassion"
                value={form.occasion || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Delivery date"
                value={form.deliveryDate || "—"}
                containerStyles="mt-4"
                titleStyles="text-gray"
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
