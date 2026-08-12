import CustomButtomSheet from "@/components/CustomButtomSheet";
import CartHeaderButton from "@/components/CartHeaderButton";
import CustomButton from "@/components/CustomButton";
import FormField from "@/components/FormField";
import {
  AreaPickerSheet,
  StatePickerSheet,
} from "@/components/DeliveryLocationSheets";
import SavedAddressSheet, {
  SAVED_ADDRESS_PLACEHOLDER,
  type SavedAddress,
} from "@/components/SavedAddressSheet";
import SpaceBetween from "@/components/SpaceBetween";
import SpaceBetweenHeader from "@/components/SpaceBetweenHeader";
import TextArea from "@/components/TextArea";
import { catalogProducts } from "@/data/meatCatalog";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import type { CheckoutRouteParams } from "@/types/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useRef, useState } from "react";
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

const DELIVERY_FEE = 5000;
const mandatoryCuts = [
  {
    id: "boneless-beef",
    name: "Boneless Beef — 1kg X (2)",
    weight: "1kg X (2)",
  },
  { id: "boneless-500", name: "Boneless Beef (500g)", weight: "500g" },
  { id: "bone-in", name: "Bone in Beef", weight: "1kg" },
  { id: "whole-chicken", name: "Whole Chicken", weight: "1.5kg" },
];

function parseSelections(value?: string): Record<string, number> {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, number>)
      : {};
  } catch {
    return {};
  }
}

function parsePrice(value?: string) {
  return Number.parseFloat((value ?? "").replace(/[^0-9.]/g, "")) || 0;
}

function formatPrice(value: number) {
  return `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatWeight(weightInGrams: number) {
  if (weightInGrams >= 1000) {
    const kilograms = weightInGrams / 1000;
    return `${Number.isInteger(kilograms) ? kilograms : kilograms.toFixed(1)}kg`;
  }
  return `${weightInGrams}g`;
}

export default function Checkout() {
  const params = useLocalSearchParams<CheckoutRouteParams>();
  const subInfo = useSubscriptionStore((state) => state.subInfo);
  const attributes = subInfo?.subscription?.attributes;
  const orderSummaryRef = useRef<BottomSheetModal>(null);
  const savedAddressRef = useRef<BottomSheetModal>(null);
  const statePickerRef = useRef<BottomSheetModal>(null);
  const areaPickerRef = useRef<BottomSheetModal>(null);
  const orderSummarySnapPoints = useMemo(() => ["90%"], []);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [state, setState] = useState("Lagos");
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [deliveryArea, setDeliveryArea] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [apartment, setApartment] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const boxSelections = useMemo(
    () => parseSelections(params.boxSelections),
    [params.boxSelections],
  );
  const addOnSelections = useMemo(
    () => parseSelections(params.addOnSelections),
    [params.addOnSelections],
  );
  const customPicks = useMemo(
    () =>
      catalogProducts.filter((product) => (boxSelections[product.id] ?? 0) > 0),
    [boxSelections],
  );
  const addOns = useMemo(
    () =>
      catalogProducts.filter(
        (product) => (addOnSelections[product.id] ?? 0) > 0,
      ),
    [addOnSelections],
  );
  const planPrice = attributes?.price ?? 0;
  const addOnsPrice = parsePrice(params.addOnsPrice);
  const orderSubtotal = parsePrice(params.total) || planPrice + addOnsPrice;
  const orderTotal = orderSubtotal + DELIVERY_FEE;

  const selectSavedAddress = (address: SavedAddress) => {
    const [selectedFirstName, ...remainingNames] = address.recipient.split(" ");

    setSavedAddress(address);
    setFirstName(selectedFirstName ?? "");
    setLastName(remainingNames.join(" "));
    setPhoneNumber(address.phone);
    setState(address.state);
    setDeliveryArea(address.deliveryArea);
    setStreetAddress(address.streetAddress);
    setApartment(address.apartment);
    setZipCode(address.zipCode);
    savedAddressRef.current?.dismiss();
  };
  const selectState = (selectedState: string) => {
    setState(selectedState);
    setDeliveryArea("");
    statePickerRef.current?.dismiss();
  };

  const selectDeliveryArea = (area: string) => {
    setDeliveryArea(area);
    areaPickerRef.current?.dismiss();
  };

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
            rightContent={<CartHeaderButton />}
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
                savedAddress
                  ? `${savedAddress.label} - ${savedAddress.streetAddress}`
                  : ""
              }
              placeholder={SAVED_ADDRESS_PLACEHOLDER}
              disabled
              onPress={() => savedAddressRef.current?.present()}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />

            <FormField
              title="First name"
              required
              value={firstName}
              placeholder="Adebola"
              handleChangeText={setFirstName}
              autoCapitalize="words"
            />
            <FormField
              title="Last name"
              required
              value={lastName}
              placeholder="Okonkwo"
              handleChangeText={setLastName}
              autoCapitalize="words"
            />
            <FormField
              title="Email"
              required
              value={email}
              placeholder="you@example.com"
              handleChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormField
              title="Phone Number"
              required
              value={phoneNumber}
              placeholder="08123456789"
              handleChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
              labelStyle="text-[#292929]"
            />
            <FormField
              title="State"
              required
              value={state}
              placeholder="Select your state"
              disabled
              onPress={() => statePickerRef.current?.present()}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />

            <FormField
              title="Delivery Area"
              required
              value={deliveryArea}
              placeholder="Select your delivery area"
              disabled
              onPress={() => areaPickerRef.current?.present()}
              rightElement={
                <Ionicons name="chevron-down" size={22} color="#8E8E8E" />
              }
            />

            <View className="flex-row items-center gap-1">
              <Switch
                value={isDefaultAddress}
                onValueChange={setIsDefaultAddress}
                trackColor={{ false: "#D5D5D5", true: "#8FC895" }}
                thumbColor={isDefaultAddress ? "#218225" : "#FFFFFF"}
                ios_backgroundColor="#D5D5D5"
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
              <Text className="font-mregular text-base">
                Set as default address
              </Text>
            </View>

            <FormField
              title="Street Address"
              required
              value={streetAddress}
              placeholder="12 Adeniyi Jones Avenue"
              handleChangeText={setStreetAddress}
              autoCapitalize="words"
            />
            <FormField
              title="Apartment"
              value={apartment}
              placeholder="e.g First Floor, Room 10"
              handleChangeText={setApartment}
            />
            <FormField
              title="Zip Code (optional)"
              value={zipCode}
              placeholder="102040"
              handleChangeText={setZipCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View className="flex-row justify-between rounded-lg border border-green bg-green-light p-3 gap-4">
              <Text className="font-msbold flex-1 text-sm">
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
                value={deliveryNote}
                placeholder="Gate code, call instructions, or preferred drop-off note."
                handleChangeText={setDeliveryNote}
                maxLength={300}
                inputContainerStyles="mt-2"
              />
              <Text className="mt-2 text-right font-mregular text-base text-gray">
                {deliveryNote.length} / 300
              </Text>
            </View>

            <View className="rounded-2xl bg-white p-4">
              <Text className="font-mbold text-xl">
                Subscription Schedule Summary
              </Text>
              <View className="mt-4 flex-row items-center justify-between">
                <Text className="font-mregular text-base text-gray">
                  Frequency
                </Text>
                <Text className="font-mregular text-base">
                  {subInfo?.selectedFrequency ?? "monthly"}
                </Text>
              </View>

              <Text className="mt-4 font-mregular text-base leading-6 text-gray">
                By continuing with your payment, you agree to our{" "}
                <Text className="font-msbold text-green underline">
                  Terms of Use
                </Text>{" "}
                and{" "}
                <Text className="font-msbold text-green underline">
                  Privacy Policy
                </Text>
                , you agree that one or more items in your cart is a deferred or
                recurring purchase, you agree to purchase a continuous
                subscription, and you agree that your payment method will
                automatically be charged at the price and frequency listed on
                this page until it ends or you cancel. Prices are subject to
                change. All cancellations are subject to our cancellation
                policy. Cancel your subscription through your account or by
                emailing{" "}
                <Text className="text-[#292929] underline">
                  support@meatng.com
                </Text>
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

      <SavedAddressSheet
        ref={savedAddressRef}
        selectedAddressId={savedAddress?.id}
        onSelect={selectSavedAddress}
      />

      <StatePickerSheet
        ref={statePickerRef}
        selectedState={state}
        onSelect={selectState}
      />

      <AreaPickerSheet
        ref={areaPickerRef}
        state={state}
        selectedArea={deliveryArea}
        onSelect={selectDeliveryArea}
      />

      <CustomButtomSheet
        ref={orderSummaryRef}
        snapPoints={orderSummarySnapPoints}
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
              <Text className="font-mregular text-base text-gray">
                Confirm your subscription box and add-ons before proceeding to
                make payment.
              </Text>
            </View>

            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Plan price"
                value={formatPrice(planPrice)}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Add-ons"
                value={formatPrice(addOnsPrice)}
                containerStyles="mt-2"
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
                value={formatPrice(orderTotal)}
                titleStyles="font-mbold text-lg"
                valueStyles="font-msbold text-lg text-green"
              />
            </View>

            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-2 font-msbold text-xl">Mandatory cuts</Text>
              {mandatoryCuts.map((item, index) => (
                <SpaceBetween
                  key={item.id}
                  title={item.name}
                  value={item.weight}
                  containerStyles={index === 0 ? "" : "mt-2"}
                  titleStyles="flex-1 text-gray"
                />
              ))}
            </View>

            <View className="rounded-2xl bg-white p-4">
              <Text className="mb-2 font-msbold text-xl text-green">
                Your custom picks
              </Text>
              {customPicks.length > 0 ? (
                <FlatList
                  data={customPicks}
                  keyExtractor={(product) => product.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  renderItem={({ item: product }) => {
                    const quantity = boxSelections[product.id] ?? 0;
                    return (
                      <SpaceBetween
                        title={
                          quantity > 1
                            ? `${product.name}  ${quantity}x`
                            : product.name
                        }
                        value={formatWeight(product.weightInGrams * quantity)}
                        titleStyles="flex-1 text-gray"
                      />
                    );
                  }}
                />
              ) : (
                <Text className="font-mregular text-base text-gray">
                  No custom picks selected.
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  orderSummaryRef.current?.dismiss();
                  router.dismissTo("/(onboarding)/BuildYourBox");
                }}
                className="mt-5 self-start active:opacity-70"
              >
                <Text className="font-msbold text-base text-green">
                  Edit full box
                </Text>
              </Pressable>
            </View>

            {addOns.length > 0 && (
              <View className="rounded-2xl bg-white p-4">
                <Text className="mb-2 font-msbold text-xl text-green">
                  Add-ons
                </Text>
                <FlatList
                  data={addOns}
                  keyExtractor={(product) => product.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View className="h-2" />}
                  renderItem={({ item: product }) => {
                    const quantity = addOnSelections[product.id] ?? 0;
                    return (
                      <SpaceBetween
                        title={
                          quantity > 1
                            ? `${product.name}  ${quantity}x`
                            : product.name
                        }
                        value={formatPrice(
                          parsePrice(product.price) * quantity,
                        )}
                        titleStyles="flex-1 text-gray"
                      />
                    );
                  }}
                />
              </View>
            )}

            <View className="rounded-2xl bg-white p-4">
              <SpaceBetween
                title="Plan"
                value={attributes?.name ?? "Subscription Plan"}
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Weight"
                value={`${attributes?.weight ?? 0}${attributes?.weight_unit ?? "kg"}`}
                containerStyles="mt-2"
                titleStyles="text-gray"
              />
              <SpaceBetween
                title="Frequency"
                value={subInfo?.selectedFrequency ?? "monthly"}
                containerStyles="mt-2"
                titleStyles="text-gray"
              />

              <View className="mt-4 items-center rounded-xl border border-dashed border-gray-300 p-4">
                <Text className="font-mregular text-xs text-gray">
                  Need to adjust your selection?
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    orderSummaryRef.current?.dismiss();
                    router.dismissTo("/(onboarding)/Plans");
                  }}
                  className="mt-2 rounded-lg border border-green px-4 py-3 active:bg-green-lighter"
                >
                  <Text className="font-msbold text-xs text-green">
                    Change Plan/Frequency
                  </Text>
                </Pressable>
              </View>
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
