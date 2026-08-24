import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();
  
  const getBackgroundColor = () => {
    if (disabled || loading) return colors.muted;
    switch (variant) {
      case "primary":
        return colors.primary;
      case "secondary":
        return colors.secondary;
      case "outline":
      case "ghost":
        return "transparent";
      case "destructive":
        return colors.destructive;
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return colors.mutedForeground;
    switch (variant) {
      case "primary":
        return colors.primaryForeground;
      case "secondary":
        return colors.secondaryForeground;
      case "outline":
      case "ghost":
        return colors.foreground;
      case "destructive":
        return colors.destructiveForeground;
      default:
        return colors.primaryForeground;
    }
  };

  const getBorderColor = () => {
    if (variant === "outline") return colors.border;
    return "transparent";
  };

  const getPadding = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case "md":
        return { paddingVertical: 12, paddingHorizontal: 20 };
      case "lg":
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          ...getPadding(),
          width: fullWidth ? "100%" : "auto",
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
              fontFamily: size === "lg" ? "Inter_600SemiBold" : "Inter_500Medium",
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
  },
  text: {
    textAlign: "center",
  },
});
