import {
  deliveryStates,
  lagosAreas,
  ogunAreas,
} from "@/constants/data";
import type { CustomBottomSheetRef } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetFlatList,
  BottomSheetSectionList,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import CustomButtomSheet from "./CustomButtomSheet";

type StatePickerSheetProps = {
  selectedState: string;
  onSelect: (state: string) => void;
};

export const StatePickerSheet = forwardRef<
  CustomBottomSheetRef,
  StatePickerSheetProps
>(({ selectedState, onSelect }, ref) => {
  const snapPoints = useMemo(() => ["50%"], []);

  return (
    <CustomButtomSheet
      ref={ref}
      snapPoints={snapPoints}
      dynamicSizing={false}
      scrollable
    >
      <View className="h-full">
        <Text className="mb-1 font-mbold text-2xl">Select state</Text>
        <Text className="mb-4 font-mregular text-sm text-gray">
          Delivery is currently available in Lagos and Ogun.
        </Text>
        <BottomSheetFlatList
          data={deliveryStates}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const isSelected = selectedState === item.name;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(item.name)}
                className={`flex-row items-center justify-between rounded-lg border p-4 active:opacity-80 ${
                  isSelected
                    ? "border-green bg-green-lighter"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="location-outline" size={21} color="#218225" />
                  <Text className="font-msbold text-base">{item.name}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#218225" />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </CustomButtomSheet>
  );
});

StatePickerSheet.displayName = "StatePickerSheet";

type AreaPickerSheetProps = {
  state: string;
  selectedArea: string;
  onSelect: (area: string) => void;
};

export const AreaPickerSheet = forwardRef<
  CustomBottomSheetRef,
  AreaPickerSheetProps
>(({ state, selectedArea, onSelect }, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);
  const sections = useMemo(() => {
    const areas = state === "Ogun" ? ogunAreas : lagosAreas;
    const grouped = new Map<string, typeof areas>();

    areas.forEach((area) => {
      const title = area.area.charAt(0).toUpperCase();
      grouped.set(title, [...(grouped.get(title) ?? []), area]);
    });

    return Array.from(grouped, ([title, data]) => ({ title, data })).sort(
      (a, b) => a.title.localeCompare(b.title),
    );
  }, [state]);

  return (
    <CustomButtomSheet
      ref={ref}
      snapPoints={snapPoints}
      dynamicSizing={false}
      scrollable
    >
      <View className="h-full">
        <Text className="mb-1 font-mbold text-2xl">Select delivery area</Text>
        <Text className="mb-4 font-mregular text-sm text-gray">
          {state ? `Areas available in ${state}.` : "Select a state first."}
        </Text>
        <BottomSheetSectionList
          sections={sections}
          keyExtractor={(item) => `${item.zoneId}-${item.area}`}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderSectionHeader={({ section }) => (
            <View className="bg-background py-2">
              <Text className="font-mbold text-sm text-green">
                {section.title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const isSelected = selectedArea === item.area;

            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(item.area)}
                className={`mb-2 flex-row items-center justify-between rounded-lg border px-4 py-3 active:opacity-80 ${
                  isSelected
                    ? "border-green bg-green-lighter"
                    : "border-gray-200 bg-white"
                }`}
              >
                <Text className="flex-1 font-msbold text-base">
                  {item.area}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="#218225" />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </CustomButtomSheet>
  );
});

AreaPickerSheet.displayName = "AreaPickerSheet";
