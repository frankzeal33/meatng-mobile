import { useNetworkStore } from "@/store/NetworkStore";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NetworkStatusBanner = () => {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStore((state) => state.isConnected);
  const isOffline = isConnected === false;

  if (!isOffline) return null;

  return (
    <View
      accessibilityLiveRegion="polite"
      className="absolute left-4 right-4 z-50 flex-row items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3"
      style={{ top: insets.top + 8, elevation: 10 }}
    >
      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-red-100">
        <Ionicons name="cloud-offline-outline" size={20} color="#B52227" />
      </View>

      <View className="flex-1">
        <Text className="font-msbold text-sm text-[#292929]">
          No internet connection
        </Text>
        <Text className="mt-0.5 font-mregular text-xs text-gray">
          Check your connection and try again.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retry internet connection"
        onPress={() => void NetInfo.refresh()}
        className="ml-3 rounded-lg bg-green px-3 py-2 active:opacity-75"
      >
        <Text className="font-msbold text-xs text-white">Retry</Text>
      </Pressable>
    </View>
  );
};

export default NetworkStatusBanner;
