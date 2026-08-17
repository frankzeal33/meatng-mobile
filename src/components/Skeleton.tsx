import { MotiView } from "moti";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

const Skeleton = ({
  width = "100%",
  height,
  borderRadius = 8,
  style,
}: SkeletonProps) => (
  <MotiView
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    from={{ opacity: 0.4 }}
    animate={{ opacity: 1 }}
    transition={{
      type: "timing",
      duration: 700,
      loop: true,
      repeatReverse: true,
    }}
    style={[
      {
        width,
        height,
        borderRadius,
        backgroundColor: "#DCECDD",
      },
      style,
    ]}
  />
);

export default Skeleton;
