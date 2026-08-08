import type { CustomButtonProps } from "@/types/components";
import { TouchableOpacity, Text } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const CustomButton = ({
  title,
  handlePress,
  containerStyles,
  bgColor,
  textStyles,
  isLoading,
  disableButton,
  rightElement,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${bgColor ? bgColor : "bg-green"} min-h-14 flex-row items-center justify-center gap-2 rounded-lg ${containerStyles} ${isLoading || disableButton ? "opacity-50" : ""}`}
      disabled={isLoading || disableButton}
    >
      {isLoading ? (
        <FontAwesome5
          name="circle-notch"
          size={20}
          color="white"
          className="animate-spin-fast"
        />
      ) : (
        <>
          <Text className={`font-mbold text-lg ${textStyles}`}>{title}</Text>
          {rightElement}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
