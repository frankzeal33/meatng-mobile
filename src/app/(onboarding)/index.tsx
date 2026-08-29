import type {
  OnboardingSlide,
  OnboardingSlideViewProps,
} from "@/types";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Carousel,
  type CarouselItemAnimation,
  type CarouselRef,
} from "react-native-reanimated-carousel";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";

const slides: OnboardingSlide[] = [
  {
    id: "chef-cuts",
    image: images.onboarding1,
    titleAccent: "Chef-grade cuts",
    titleRest: "curated for flavor",
    description:
      "Carefully selected premium cuts, hygienically processed and vacuum-sealed to deliver exceptional quality and freshness in every box.",
  },
  {
    id: "flexible-box",
    image: images.onboarding2,
    titleAccent: "Flexible monthly",
    titleRest: "boxes you control",
    description:
      "Build your box your way, then pause, skip, or reschedule deliveries whenever your plans change.",
  },
  {
    id: "meat-lovers",
    image: images.onboarding3,
    titleAccent: "Meat Lovers Club",
    titleRest: "access included",
    description:
      "Enjoy exclusive member rewards, priority access, special offers, and premium content made for meat lovers.",
  },
];

const fadeAnimation: CarouselItemAnimation = (relativeProgress) => {
  "worklet";

  return {
    opacity: Math.max(0, 1 - Math.abs(relativeProgress)),
    transform: [{ translateX: 0 }],
    zIndex: Math.round((1 - Math.abs(relativeProgress)) * 10),
  };
};

function OnboardingSlideView({
  image,
  titleAccent,
  titleRest,
  description,
  currentIndex,
  skipOpacity,
  onGetStarted,
  onLogin,
  onGoToSlide,
  onSkip,
}: OnboardingSlideViewProps) {
  return (
    <View className="flex-1 px-4 py-4">
      <Animated.View
        pointerEvents={currentIndex < slides.length - 1 ? "auto" : "none"}
        className="items-end justify-center"
        style={{ opacity: skipOpacity }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={12}
          onPress={onSkip}
        >
          <Text className="font-mmedium text-xl text-green">Skip</Text>
        </Pressable>
      </Animated.View>

      <View className="mt-4 w-full overflow-hidden rounded-2xl bg-[#F1F4F1] flex-1">
        <ExpoImage
          source={image}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={250}
        />
      </View>

      <View className="mt-8 mb-20">
        <Text className="font-mbold text-[34px] leading-11.25 tracking-[-1.3px] text-[#292929]">
          <Text className="text-green">{titleAccent}</Text>
          {"\n"}
          {titleRest}
        </Text>
        <Text className="mt-3 font-mregular text-base leading-6 text-gray">
          {description}
        </Text>
      </View>

      <View className="items-center pb-5">
        <View className="flex-row items-center gap-1">
          {slides.map((slide, index) => {
            const isActive = currentIndex === index;
            return (
              <Pressable
                key={slide.id}
                accessibilityRole="button"
                accessibilityLabel={`Go to onboarding slide ${index + 1}`}
                accessibilityState={{ selected: isActive }}
                onPress={() => onGoToSlide(index)}
                className={`h-2 rounded-full ${
                  isActive ? "w-4 bg-green" : "w-2 bg-[#C9D7CA]"
                }`}
              />
            );
          })}
        </View>
      </View>

      <View className="z-20 gap-4">
        <CustomButton
          title="Get Started"
          handlePress={onGetStarted}
          containerStyles="w-full"
          textStyles="text-white"
        />
        <CustomButton
          title="Log In"
          handlePress={onLogin}
          containerStyles="w-full bg-white border border-green"
          textStyles="text-green"
        />
      </View>
    </View>
  );
}

export default function Index() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<CarouselRef>(null);
  const skipOpacity = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const availableHeight = height - insets.top - insets.bottom;

  const handleSlideChange = useCallback(
    (nextIndex: number) => {
      setCurrentIndex(nextIndex);
      Animated.timing(skipOpacity, {
        toValue: nextIndex === slides.length - 1 ? 0 : 1,
        duration: 320,
        useNativeDriver: true,
      }).start();
    },
    [skipOpacity],
  );

  const goToSlide = useCallback((index: number) => {
    carouselRef.current?.scrollTo({ index, animated: true });
  }, []);

  const handleGetStarted = useCallback(() => {
    router.push("/(onboarding)/Plans");
  }, []);

  const handleLogin = useCallback(() => {
    router.push("/(onboarding)/Login");
  }, []);

  const handleSkip = useCallback(() => {
    Animated.timing(skipOpacity, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start();
    setCurrentIndex(slides.length - 1);
    goToSlide(slides.length - 1);
  }, [goToSlide, skipOpacity]);

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View
        pointerEvents="none"
        className="absolute -right-45 -top-45 size-105 overflow-hidden rounded-full"
      >
        <LinearGradient
          colors={["#FFF", "#EFFBF1", "#AFE9B8"]}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </View>

      <Carousel
        ref={carouselRef}
        data={slides}
        itemSize={width}
        style={{ width, height: availableHeight }}
        loop
        autoplay
        autoplayInterval={4500}
        animation={{ type: "timing", duration: 900 }}
        snapMode="page"
        itemAnimation={fadeAnimation}
        onSnapToItem={handleSlideChange}
        onConfigurePanGesture={(gesture) => {
          gesture.activeOffsetX([-10, 10]);
          gesture.failOffsetY([-8, 8]);
        }}
        renderItem={({ item }) => (
          <OnboardingSlideView
            {...item}
            currentIndex={currentIndex}
            skipOpacity={skipOpacity}
            onGetStarted={handleGetStarted}
            onLogin={handleLogin}
            onGoToSlide={goToSlide}
            onSkip={handleSkip}
          />
        )}
      />
    </View>
  );
}
