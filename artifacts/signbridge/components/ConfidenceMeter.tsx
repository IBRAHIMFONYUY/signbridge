import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  confidence: number;
  label?: string;
}

export function ConfidenceMeter({ confidence, label = "Confidence" }: Props) {
  const colors = useColors();
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animVal, {
      toValue: confidence,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [confidence]);

  const barColor = animVal.interpolate({
    inputRange: [0, 0.4, 0.7, 1],
    outputRange: [colors.destructive, colors.warning, colors.primary, colors.success],
  });

  const pct = Math.round(confidence * 100);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.pct, { color: pct > 70 ? colors.success : pct > 40 ? colors.warning : colors.destructive }]}>
          {pct}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: animVal.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, fontFamily: "Inter_500Medium", letterSpacing: 0.5 },
  pct: { fontSize: 12, fontFamily: "Inter_700Bold" },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
});
