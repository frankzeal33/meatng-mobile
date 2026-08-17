import type {
  CustomBottomSheetProps,
  CustomBottomSheetRef,
} from "@/types";
import React, { forwardRef, useCallback } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

const CustomButtomSheet = forwardRef<
  CustomBottomSheetRef,
  CustomBottomSheetProps
>((props, ref) => {
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      {...(!props.dynamicSizing && { snapPoints: props.snapPoints })} // only pass when not dynamic
      enablePanDownToClose={
        props.enablePenDown === undefined ? true : props.enablePenDown
      }
      handleIndicatorStyle={{ display: "none" }}
      stackBehavior="push"
      backdropComponent={renderBackdrop}
      enableDynamicSizing={
        props.dynamicSizing === undefined ? true : props.dynamicSizing
      }
      onDismiss={props.onDismiss}
      backgroundStyle={{
        backgroundColor: "#F7F7F5", // set your desired bg color here
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
      }}
      style={{
        shadowColor: "#000", // Example shadow color
        shadowOffset: { width: 0, height: 2 }, // Example shadow offset
        shadowOpacity: 0.2, // Example shadow opacity
        shadowRadius: 3, // Example shadow radius
        elevation: 5, // Example elevation (Android)
      }}
      // enableContentPanningGesture={false}
    >
      {props.scrollable ? (
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
        >
          {props.children}
        </View>
      ) : (
        <BottomSheetView
          style={{
            flex: 1,
            paddingHorizontal: 16,
            paddingBottom: 32,
          }}
        >
          {props.children}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  );
});

export default CustomButtomSheet;
