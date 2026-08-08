import type { TextAreaProps } from "@/types/components";
import { View, Text, TextInput } from "react-native";
import { useState } from "react";

const TextArea = ({
  title,
  value,
  placeholder,
  handleChangeText,
  labelStyle,
  otherStyles,
  inputBg,
  inputContainerStyles,
  ...props
}: TextAreaProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`space-y-2 w-full ${otherStyles}`}>
      {title ? (
        <Text
          className={`pb-2 font-mmedium text-base ${labelStyle ? labelStyle : "text-blue"}`}
        >
          {title}
        </Text>
      ) : null}
      <View
        className={`border ${isFocused ? "border-green" : "border-gray-300"} h-44 w-full flex-row rounded-lg px-4 py-2 ${inputBg ?? "bg-white"} ${inputContainerStyles ?? ""}`}
      >
        <TextInput
          className={`h-40 flex-1 font-mregular text-base text-black ${inputBg ?? "bg-white"}`}
          textAlignVertical="top"
          multiline={true}
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#A3A3A3"
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
    </View>
  );
};

export default TextArea;
