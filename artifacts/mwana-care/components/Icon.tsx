import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface IconProps {
  name: keyof typeof Feather.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 20, color, style }: IconProps) {
  const colors = useColors();
  
  return (
    <Feather
      name={name}
      size={size}
      color={color || colors.primary}
      style={style}
    />
  );
}
