import type {
  ReferralActionButtonProps,
  ReferralHistoryItem,
  ReferralHistoryListItemProps,
  ReferralStat,
  ReferralStatCardProps,
} from "@/types/general";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import { FlatList, Pressable, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const referralCode = "WY548NAB";
const referralLink = `https://meatng.com/register?ref=${referralCode}`;

const referralStats: ReferralStat[] = [
  {
    id: "total",
    icon: "account-multiple",
    label: "Total Referrals",
    value: "3",
  },
  { id: "pending", icon: "history", label: "Pending", value: "1" },
  { id: "completed", icon: "check-circle", label: "Completed", value: "2" },
  { id: "rewarded", icon: "medal", label: "Rewarded", value: "1" },
  { id: "earnings", icon: "cash", label: "Your Earnings", value: "₦500.00" },
  { id: "friends", icon: "gift", label: "Friends Earned", value: "₦1,000.00" },
];

const referralHistory: ReferralHistoryItem[] = [
  {
    id: "referral-1",
    name: "Adebola Okonkwo",
    date: "5 Aug 2026",
    status: "Rewarded",
    reward: "₦500.00",
  },
  {
    id: "referral-2",
    name: "Tolu Adebayo",
    date: "3 Aug 2026",
    status: "Completed",
    reward: "₦500.00",
  },
  {
    id: "referral-3",
    name: "Chisom Nwankwo",
    date: "1 Aug 2026",
    status: "Pending",
    reward: "₦0.00",
  },
];

function ReferralActionButton({
  icon,
  label,
  onPress,
}: ReferralActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-11 flex-1 flex-row items-center justify-center gap-1 rounded-lg bg-white active:opacity-75"
    >
      <MaterialCommunityIcons name={icon} size={12} color="#218225" />
      <Text className="font-msbold text-xs text-green">{label}</Text>
    </Pressable>
  );
}

function ReferralStatCard({ item }: ReferralStatCardProps) {
  return (
    <View
      className="min-h-28 flex-1 rounded-xl bg-white p-3"
    >
      <View className="size-9 items-center justify-center rounded-full bg-green-light">
        <MaterialCommunityIcons name={item.icon} size={18} color="#218225" />
      </View>
      <Text className="mt-3 font-mregular text-[10px] text-gray">
        {item.label}
      </Text>
      <Text className="mt-1 font-mbold text-sm">{item.value}</Text>
    </View>
  );
}

function ReferralHistoryListItem({ item }: ReferralHistoryListItemProps) {
  return (
    <View className="bg-white px-4">
      <View className="flex-row items-center border-t border-gray-100 py-4">
        <View className="size-10 items-center justify-center rounded-full bg-green-light">
          <Text className="font-mbold text-base text-green">
            {item.name.charAt(0)}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-msbold text-sm">{item.name}</Text>
          <Text className="mt-1 font-mregular text-[10px] text-gray">
            {item.date}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-msbold text-xs text-green">{item.reward}</Text>
          <Text
            className={`mt-1 font-mregular text-[10px] ${item.status === "Pending" ? "text-[#C58920]" : "text-gray"}`}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const shareReferral = async () => {
    await Share.share({
      title: "Join me on MeatNG",
      message: `Use my MeatNG referral code ${referralCode} and earn ₦500 credit: ${referralLink}`,
      url: referralLink,
    });
  };
  const shareCode = async () => {
    await Share.share({ message: referralCode });
  };
  const shareLink = async () => {
    await Share.share({ message: referralLink, url: referralLink });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <FlatList
        data={referralHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReferralHistoryListItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 20,
        }}
        ListHeaderComponent={
          <View>
            <Text className="font-mbold text-xl">Referral Program</Text>
            <Text className="mt-1 font-mregular text-xs text-gray">
              Invite friends and earn ₦500 credit for every signup.
            </Text>

            <View className="mt-6 rounded-xl bg-green p-4">
              <Text className="font-mbold text-lg text-white">
                Share your code, earn rewards
              </Text>
              <Text className="mt-1 font-mregular text-xs text-white">
                When a friend signs up with your code, you both get ₦500 credit.
              </Text>
              <View className="mt-4 h-11 items-center justify-center rounded-lg bg-green-mildLight">
                <Text selectable className="font-mbold text-base text-green">
                  {referralCode}
                </Text>
              </View>
              <View className="mt-4 flex-row gap-2">
                <ReferralActionButton
                  icon="content-copy"
                  label="Copy Code"
                  onPress={shareCode}
                />
                <ReferralActionButton
                  icon="link-variant"
                  label="Copy Link"
                  onPress={shareLink}
                />
                <ReferralActionButton
                  icon="share-variant"
                  label="Share"
                  onPress={shareReferral}
                />
              </View>
            </View>

            <View className="mt-4 gap-3">
              <View className="flex-row gap-3">
                {referralStats.slice(0, 3).map((item) => (
                  <ReferralStatCard key={item.id} item={item} />
                ))}
              </View>
              <View className="flex-row gap-3">
                {referralStats.slice(3).map((item) => (
                  <ReferralStatCard key={item.id} item={item} />
                ))}
              </View>
            </View>

            <View
              className="mt-4 rounded-t-2xl bg-white px-4 pb-3 pt-4"
            >
              <Text className="font-mbold text-base">Referral History</Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="h-4 rounded-b-2xl bg-white" />
        }
      />
    </View>
  );
}
