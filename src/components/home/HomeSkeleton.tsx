import Skeleton from "@/components/Skeleton";
import { View } from "react-native";

const OverviewSkeleton = () => (
  <View className="flex-1 rounded-xl bg-white p-4">
    <Skeleton width={40} height={40} borderRadius={20} />
    <Skeleton width="65%" height={10} style={{ marginTop: 12 }} />
    <Skeleton width="82%" height={18} style={{ marginTop: 8 }} />
  </View>
);

const DetailSkeleton = () => (
  <View className="flex-row items-center" style={{ width: "48%" }}>
    <Skeleton width={24} height={24} borderRadius={12} />
    <View className="ml-2 flex-1">
      <Skeleton width="60%" height={8} />
      <Skeleton width="90%" height={11} style={{ marginTop: 5 }} />
    </View>
  </View>
);

const HomeSkeleton = () => (
  <View className="mt-4">
    <View className="gap-3">
      <View className="flex-row gap-3">
        <OverviewSkeleton />
        <OverviewSkeleton />
      </View>
      <View className="flex-row gap-3">
        <OverviewSkeleton />
        <OverviewSkeleton />
      </View>
    </View>

    <View className="mt-4 overflow-hidden rounded-xl bg-white">
      <View className="flex-row justify-between bg-green-light px-4 py-6">
        <View className="flex-1">
          <Skeleton width={110} height={20} borderRadius={10} />
          <Skeleton width="75%" height={20} style={{ marginTop: 12 }} />
          <Skeleton width="60%" height={10} style={{ marginTop: 8 }} />
        </View>
        <View className="ml-4 items-end">
          <Skeleton width={84} height={20} />
          <Skeleton width={45} height={8} style={{ marginTop: 7 }} />
        </View>
      </View>

      <View className="px-4 py-5">
        <View className="flex-row flex-wrap justify-between gap-y-4">
          <DetailSkeleton />
          <DetailSkeleton />
          <DetailSkeleton />
        </View>
        <View className="mt-6 flex-row gap-2">
          <Skeleton width={145} height={44} borderRadius={8} />
          <Skeleton width={130} height={44} borderRadius={8} />
        </View>
      </View>
    </View>

    <View className="mt-4 flex-row items-center rounded-xl bg-white p-4">
      <Skeleton width={40} height={40} borderRadius={20} />
      <View className="ml-3 flex-1">
        <Skeleton width={95} height={16} />
        <Skeleton width={175} height={10} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
  </View>
);

export default HomeSkeleton;
