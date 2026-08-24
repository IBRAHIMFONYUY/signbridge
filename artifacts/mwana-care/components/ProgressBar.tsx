import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  progress: number; // 0 to 1
  style?: ViewStyle;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  style,
  height = 8,
  color,
  backgroundColor,
}: ProgressBarProps) {
  const colors = useColors();
  
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: backgroundColor || colors.input,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color || colors.primary,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  fill: {
    height: "100%",
  },
});
