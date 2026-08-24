import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "md";
  style?: ViewStyle;
}

export function Badge({ children, variant = "default", size = "md", style }: BadgeProps) {
  const colors = useColors();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return colors.primary + "22";
      case "success":
        return colors.success + "22";
      case "warning":
        return colors.warning + "22";
      case "destructive":
        return colors.destructive + "22";
      default:
        return colors.muted;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return colors.primary;
      case "success":
        return colors.success;
      case "warning":
        return colors.warning;
      case "destructive":
        return colors.destructive;
      default:
        return colors.foreground;
    }
  };

  const getPadding = () => {
    return size === "sm" ? { paddingHorizontal: 8, paddingVertical: 4 } : { paddingHorizontal: 12, paddingVertical: 6 };
  };

  const getFontSize = () => {
    return size === "sm" ? 11 : 12;
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: getFontSize(),
            fontFamily: "Inter_600SemiBold",
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
