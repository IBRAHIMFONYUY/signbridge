import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({ children, style, padding = 16, variant = "default" }: CardProps) {
  const colors = useColors();
  
  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: colors.radius,
    padding,
    ...style,
  };

  if (variant === "elevated") {
    cardStyle.shadowColor = "#000";
    cardStyle.shadowOffset = { width: 0, height: 2 };
    cardStyle.shadowOpacity = 0.1;
    cardStyle.shadowRadius = 8;
    cardStyle.elevation = 4;
  } else if (variant === "outlined") {
    cardStyle.borderWidth = 1;
    cardStyle.borderColor = colors.border;
  }

  return <View style={cardStyle}>{children}</View>;
}
