import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  word: string;
  size?: number;
}

const SIGN_SHAPES: Record<string, { fingers: boolean[]; thumb: boolean }> = {
  HELLO: { fingers: [true, true, true, true, true], thumb: true },
  HELP: { fingers: [true, true, false, false, false], thumb: true },
  THANK: { fingers: [true, true, true, true, true], thumb: false },
  YES: { fingers: [true, false, false, false, false], thumb: false },
  NO: { fingers: [true, true, false, false, false], thumb: false },
  PLEASE: { fingers: [true, true, true, true, true], thumb: true },
  SORRY: { fingers: [true, false, false, false, false], thumb: true },
  GOOD: { fingers: [true, true, true, true, false], thumb: true },
  BAD: { fingers: [false, true, true, true, true], thumb: false },
  LOVE: { fingers: [true, false, false, false, true], thumb: true },
};

function getShape(word: string) {
  const upper = word.toUpperCase().trim();
  return SIGN_SHAPES[upper] ?? { fingers: [true, true, true, true, true], thumb: true };
}

export function SignAvatar({ word, size = 120 }: Props) {
  const colors = useColors();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fingerAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  const shape = getShape(word);

  useEffect(() => {
    if (!word) return;
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true, tension: 80 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80 }),
    ]).start();

    shape.fingers.slice(0, 4).forEach((extended, i) => {
      Animated.spring(fingerAnims[i], {
        toValue: extended ? 0 : 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -4, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      { iterations: 3 }
    ).start();
  }, [word]);

  const fingerNames = ["Index", "Middle", "Ring", "Pinky"];

  return (
    <View style={[styles.container, { width: size + 40, alignItems: "center" }]}>
      <Animated.View
        style={[
          styles.hand,
          {
            width: size,
            height: size * 1.2,
            backgroundColor: colors.primary + "22",
            borderColor: colors.primary + "55",
            transform: [{ scale: scaleAnim }, { translateY: bounceAnim }],
          },
        ]}
      >
        <View style={styles.palm}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.finger,
                {
                  backgroundColor: colors.primary,
                  height: i === 1 ? 44 : i === 2 ? 40 : 36,
                  transform: [
                    {
                      scaleY: fingerAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0.35],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: shape.thumb ? colors.primary : colors.border,
            },
          ]}
        />
      </Animated.View>
      {word ? (
        <Text style={[styles.wordLabel, { color: colors.primary }]}>{word}</Text>
      ) : (
        <Text style={[styles.wordLabel, { color: colors.mutedForeground }]}>Waiting…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 12 },
  hand: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 12,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  palm: {
    flexDirection: "row",
    gap: 5,
    alignItems: "flex-end",
    marginBottom: 4,
  },
  finger: {
    width: 12,
    borderRadius: 6,
  },
  thumb: {
    position: "absolute",
    left: 6,
    bottom: 18,
    width: 10,
    height: 26,
    borderRadius: 5,
    transform: [{ rotate: "-30deg" }],
  },
  wordLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
