import type { CountDownProps } from "@/types";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const CountDown = ({ initialSeconds, onFinish }: CountDownProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const hasFinished = useRef(false);

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Call onFinish AFTER render
  useEffect(() => {
    if (secondsLeft === 0 && !hasFinished.current) {
      hasFinished.current = true;
      onFinish?.();
    }
  }, [secondsLeft, onFinish]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (hours > 0) {
      return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
    }

    if (minutes > 0) {
      return `${pad(minutes)} : ${pad(seconds)}`;
    }

    return pad(seconds);
  };

  return (
    <View>
      <Text className="font-msbold text-base text-green">
        {formatTime(secondsLeft)}
      </Text>
    </View>
  );
};

export default CountDown;
