import type { FormFieldSheetProps } from "@/types/components";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import { useState } from "react";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import Ionicons from "@expo/vector-icons/Ionicons";

const FormFieldSheet = ({
  title,
  value,
  placeholder,
  inputBg,
  keyboardType,
  handleChangeText,
  labelStyle,
  otherStyles,
  ...props
}: FormFieldSheetProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View className={`space-y-2 w-full ${otherStyles}`}>
      <Text
        className={`text-base font-mmedium pb-2 ${labelStyle ? labelStyle : "text-blue"}`}
      >
        {title}
      </Text>
      <View
        className={`${inputBg ? inputBg : "bg-inputBg"} border ${isFocused ? "border-green" : "border-inputBg"} w-full h-14 px-4 rounded-md items-center flex-row gap-1`}
      >
        <BottomSheetTextInput
          className={`${inputBg ? inputBg : "bg-inputBg"} flex-1 text-black font-mregular text-base h-full`}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#ccc"
          onChangeText={handleChangeText}
          secureTextEntry={
            title === "Password*"
              ? !showPassword
              : title === "Confirm Password*"
                ? !showConfirmPassword
                : false
          }
          keyboardType={keyboardType ? keyboardType : "default"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {title === "Confirm Password*" && (
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={!showConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color="#C3C3C3"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormFieldSheet;
