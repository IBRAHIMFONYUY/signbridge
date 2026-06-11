import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

interface Props {
  word: string;
  index: number;
  onRemove: () => void;
  primaryColor: string;
  foregroundColor: string;
}

export function WordChip({ word, index, onRemove, primaryColor, foregroundColor }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.chip,
        {
          backgroundColor: primaryColor + "22",
          borderColor: primaryColor + "66",
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={[styles.word, { color: primaryColor }]}>{word}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
        <Feather name="x" size={12} color={primaryColor} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  word: { fontFamily: "Inter_600SemiBold", fontSize: 12, letterSpacing: 0.5 },
});
