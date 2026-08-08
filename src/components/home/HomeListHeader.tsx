import type { HomeListHeaderProps } from "@/types/home";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

export default function HomeListHeader({
  title,
  subtitle,
  filters,
  selectedFilter,
  searchValue,
  onFilterChange,
  onSearchChange,
}: HomeListHeaderProps) {
  return (
    <View className="bg-background pb-3">
      <View className="flex-row items-center px-4 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="size-10 items-center justify-center rounded-full bg-green-light active:opacity-70"
        >
          <Ionicons name="arrow-back" size={21} color="#657466" />
        </Pressable>
        <View className="ml-2 flex-1">
          <Text className="font-mbold text-xl">{title}</Text>
          <Text className="font-mregular text-xs text-gray">{subtitle}</Text>
        </View>
      </View>

      <View className="mx-4 mt-2 h-12 flex-row items-center rounded-lg border border-gray-300 bg-white px-4">
        <Ionicons name="search-outline" size={22} color="#929292" />
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          placeholder="Search for order type or reference......"
          placeholderTextColor="#A3A3A3"
          className="ml-3 h-full flex-1 font-mregular text-xs text-black"
        />
      </View>

      <FlatList
        horizontal
        data={filters}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 14 }}
        renderItem={({ item }) => {
          const selected = selectedFilter === item.id;
          return (
            <Pressable
              onPress={() => onFilterChange(item.id)}
              className={`h-9 items-center justify-center rounded-lg border px-4 ${
                selected ? "border-green bg-green-light" : "border-gray-300 bg-white"
              }`}
            >
              <Text className={`font-mregular text-[10px] ${selected ? "text-green" : "text-gray"}`}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
