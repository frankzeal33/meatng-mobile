import CustomButtomSheet from "@/components/CustomButtomSheet";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import type {
  GiftCheckoutForm,
  GiftCheckoutRouteParams,
  GiftIncludedCut,
} from "@/types/gift";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const savedAddresses = [
  "Select a saved address",
  "Home - 12 Adeniyi Jones Avenue",
];
const states = ["Select your state", "Lagos", "Ogun", "Oyo"];
const deliveryAreas = [
  "Select your delivery area",
  "Ikeja",
  "Lekki",
  "Victoria Island",
];
const DELIVERY_FEE = 5000;

function nextOption(options: string[], current: string) {
  return options[(options.indexOf(current) + 1) % options.length];
}

function parsePrice(value?: string) {
  return Number.parseFloat((value ?? "").replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function parseIncludedCuts(value?: string): GiftIncludedCut[] {
  if (!value) return [];

  try {
    const cuts: unknown = JSON.parse(value);
    return Array.isArray(cuts) ? (cuts as GiftIncludedCut[]) : [];
  } catch {
    return [];
  }
}

function getCutDetails(name: string) {
  const parts = name.split(" - ");
  const weight = parts.length > 1 ? parts.pop() : "";
  return { name: parts.join(" - "), weight };
}

export default function GiftCheckoutScreen() {
  const params = useLocalSearchParams<GiftCheckoutRouteParams>();
  const orderSummaryRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["90%"], []);
  const [form, setForm] = useState<GiftCheckoutForm>({
    savedAddress: savedAddresses[0],
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    state: states[0],
    isDefaultAddress: false,
    deliveryArea: deliveryAreas[0],
    streetAddress: "",
    apartment: "",
    zipCode: "",
    deliveryNote: "",
  });
  const update = useCallback(
    <K extends keyof GiftCheckoutForm>(key: K, value: GiftCheckoutForm[K]) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );
  const giftPrice = parsePrice(params.price);
  const total = giftPrice + DELIVERY_FEE;
  const includedCuts = useMemo(
    () => parseIncludedCuts(params.includedCuts),
    [params.includedCuts],
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
          <Text className="font-mbold text-2xl">Delivery Information</Text>
          <View className="mt-4 gap-4">
            <FormField
              title="Use a saved address"
              value={
                form.savedAddress === savedAddresses[0] ? "" : form.savedAddress
              }
              placeholder={savedAddresses[0]}
              disabled
              onPress={() =>
                update(
                  "savedAddress",
                  nextOption(savedAddresses, form.savedAddress),
                )
              }
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />
            <FormField
              title="First name"
              required
              value={form.firstName}
              placeholder="Adebola"
              handleChangeText={(value) => update("firstName", value)}
              autoCapitalize="words"
            />
            <FormField
              title="Last name"
              required
              value={form.lastName}
              placeholder="Okonkwo"
              handleChangeText={(value) => update("lastName", value)}
              autoCapitalize="words"
            />
            <FormField
              title="Email"
              required
              value={form.email}
              placeholder="you@example.com"
              handleChangeText={(value) => update("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              title="Phone Number"
              required
              value={form.phoneNumber}
              placeholder="08123456789"
              handleChangeText={(value) => update("phoneNumber", value)}
              keyboardType="phone-pad"
              maxLength={11}
              labelStyle="text-[#292929]"
            />
            <FormField
              title="State"
              required
              value={form.state === states[0] ? "" : form.state}
              placeholder={states[0]}
              disabled
              onPress={() => update("state", nextOption(states, form.state))}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />
            <View className="flex-row items-center gap-1">
              <Switch
                value={form.isDefaultAddress}
                onValueChange={(value) => update("isDefaultAddress", value)}
                trackColor={{ false: "#D5D5D5", true: "#8FC895" }}
                thumbColor={form.isDefaultAddress ? "#218225" : "#FFFFFF"}
                ios_backgroundColor="#D5D5D5"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text className="font-mregular text-base">
                Set as default address
              </Text>
            </View>
            <FormField
              title="Delivery Area"
              required
              value={
                form.deliveryArea === deliveryAreas[0] ? "" : form.deliveryArea
              }
              placeholder={deliveryAreas[0]}
              disabled
              onPress={() =>
                update(
                  "deliveryArea",
                  nextOption(deliveryAreas, form.deliveryArea),
                )
              }
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />
            <FormField
              title="Street Address"
              required
              value={form.streetAddress}
              placeholder="12 Adeniyi Jones Avenue"
              handleChangeText={(value) => update("streetAddress", value)}
              autoCapitalize="words"
            />
            <FormField
              title="Apartment"
              value={form.apartment}
              placeholder="e.g First Floor, Room 10"
              handleChangeText={(value) => update("apartment", value)}
            />
            <FormField
              title="Zip Code (optional)"
              value={form.zipCode}
              placeholder="102040"
              handleChangeText={(value) => update("zipCode", value)}
              keyboardType="number-pad"
              maxLength={6}
            />
            <View className="flex-row justify-between gap-4 rounded-lg border border-green bg-green-light p-3">
              <Text className="flex-1 font-msbold text-sm">
                Abraham Adesanya
              </Text>
              <View className="items-end">
                <Text className="font-mbold text-sm text-green">₦5,000.00</Text>
                <Text className="mt-1 font-mregular text-xs text-gray">
                  delivery fee
                </Text>
              </View>
            </View>
            <View className="mt-2">
              <Text className="font-msbold text-xl">
                Delivery Note{" "}
                <Text className="font-mregular text-sm text-gray">
                  (Optional)
                </Text>
              </Text>
              <TextArea
                value={form.deliveryNote}
                placeholder="Gate code, call instructions, or preferred drop-off note."
                handleChangeText={(value) => update("deliveryNote", value)}
                maxLength={300}
                inputContainerStyles="mt-2"
              />
              <Text className="mt-2 text-right font-mregular text-base text-gray">
                {form.deliveryNote.length} / 300
              </Text>
            </View>
          </View>
        </ScrollView>
        <View className="px-4">
          <CustomButton
            title="Continue"
            handlePress={() => orderSummaryRef.current?.present()}
            containerStyles="mb-1 mt-2 w-full"
            textStyles="text-white"
          />
        </View>
      </KeyboardAvoidingView>

      <CustomButtomSheet
        ref={orderSummaryRef}
        snapPoints={snapPoints}
        dynamicSizing={false}
        enablePenDown={false}
        scrollable
      >
        <View className="h-full">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close order summary"
            hitSlop={10}
            onPress={() => orderSummaryRef.current?.dismiss()}
            className="mb-3 size-12 items-center justify-center rounded-full bg-green-light"
          >
            <Ionicons name="arrow-back" size={22} color="#218225" />
          </Pressable>
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          >
            <View className="mb-1">
              <Text className="font-mbold text-2xl">Order Summary</Text>
            </View>
            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-3 font-mbold text-xl">Included cuts</Text>
              {includedCuts.length > 0 ? (
                <FlatList
                  data={includedCuts}
                  scrollEnabled={false}
                  keyExtractor={(item) => item.id}
                  ItemSeparatorComponent={() => <View className="h-3" />}
                  renderItem={({ item }) => {
                    const cut = getCutDetails(item.name);
                    const showQuantity = item.quantity !== "1x";

                    return (
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1 flex-row items-center gap-2">
                          <Text className="shrink font-mregular text-base text-gray">
                            {cut.name}
                          </Text>
                          {showQuantity && (
                            <View className="rounded-full bg-green-light px-2 py-1">
                              <Text className="font-msbold text-xs text-green">
                                {item.quantity}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="font-mregular text-base">
                          {cut.weight || item.quantity}
                        </Text>
                      </View>
                    );
                  }}
                />
              ) : (
                <Text className="font-mregular text-base text-gray">
                  No included cuts available.
                </Text>
              )}
            </View>
            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Box"
                value={params.giftName ?? "Gift Box"}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Weight"
                value={(params.weight ?? "—").replace(" box", "")}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
            </View>
            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-3 font-mbold text-xl text-green">
                Recipient Information
              </Text>
              <SpaceBetween
                title="Recipient name"
                value={params.recipientName ?? "—"}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Phone Number"
                value={params.recipientPhone ?? "—"}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Email"
                value={params.recipientEmail ?? "—"}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Occasion"
                value={params.occasion ?? "—"}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Delivery date"
                value={params.deliveryDate ?? "—"}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Delivery window"
                value={params.deliveryWindow ?? "—"}
                containerStyles="mt-3"
                titleStyles="text-gray"
              />
              {!!params.giftNote && (
                <View className="mt-4 w-full">
                  <Text className="font-msbold text-base text-green">
                    Gift note
                  </Text>
                  <Text className="mt-2 font-mregular text-base leading-6 text-gray">
                    {params.giftNote}
                  </Text>
                </View>
              )}
            </View>
            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Box price"
                value={formatPrice(giftPrice)}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Delivery Fee"
                value={formatPrice(DELIVERY_FEE)}
                containerStyles="mt-2"
                titleStyles="text-gray"
              />
              <View className="my-2 h-px bg-gray-200" />
              <SpaceBetween
                title="Total"
                value={formatPrice(total)}
                titleStyles="font-mbold text-lg"
                valueStyles="font-msbold text-lg text-green"
              />
            </View>
            <Text className="font-mregular text-xs text-gray">
              Make sure you complete delivery information before payment.
            </Text>
          </BottomSheetScrollView>
          <CustomButton
            title="Pay Now"
            handlePress={() => {}}
            containerStyles="mb-2 mt-4 w-full"
            textStyles="text-white"
          />
        </View>
      </CustomButtomSheet>
    </SafeAreaView>
  );
}
