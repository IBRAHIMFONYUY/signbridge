import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface Props {
  confidence: number;
  size?: number;
  gesture?: string;
  primaryColor: string;
  successColor: string;
  mutedColor: string;
  foregroundColor: string;
  confirmed?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ConfidenceRing({
  confidence,
  size = 100,
  gesture,
  primaryColor,
  successColor,
  mutedColor,
  foregroundColor,
  confirmed,
}: Props) {
  const animConf = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const R = (size - 10) / 2;
  const circumference = 2 * Math.PI * R;

  useEffect(() => {
    Animated.spring(animConf, {
      toValue: confidence,
      useNativeDriver: false,
      tension: 40,
      friction: 10,
    }).start();
  }, [confidence]);

  useEffect(() => {
    if (confirmed) {
      Animated.sequence([
        Animated.spring(pulseAnim, { toValue: 1.12, useNativeDriver: true, tension: 80 }),
        Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true, tension: 80 }),
      ]).start();
    }
  }, [confirmed]);

  const strokeDashoffset = animConf.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const ringColor = confidence >= 0.85 ? successColor : primaryColor;
  const pct = Math.round(confidence * 100);

  return (
    <Animated.View style={[styles.container, { width: size, height: size, transform: [{ scale: pulseAnim }] }]}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="transparent"
          stroke={mutedColor}
          strokeWidth={6}
          strokeOpacity={0.3}
        />
        {/* Progress arc — rotated so 0° is at the top */}
        <G transform={`rotate(-90, ${size / 2}, ${size / 2})`}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="transparent"
            stroke={ringColor}
            strokeWidth={6}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset as unknown as number}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.center}>
        {gesture ? (
          <Text style={[styles.gestureText, { color: foregroundColor, fontSize: size * 0.12 }]} numberOfLines={1}>
            {gesture}
          </Text>
        ) : null}
        <Text
          style={[
            styles.pctText,
            { color: confidence >= 0.85 ? successColor : primaryColor, fontSize: size * 0.18 },
          ]}
        >
          {pct}%
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: "relative", justifyContent: "center", alignItems: "center" },
  center: { position: "absolute", alignItems: "center", gap: 1 },
  gestureText: { fontFamily: "Inter_700Bold", letterSpacing: 1, textAlign: "center" },
  pctText: { fontFamily: "Inter_700Bold" },
});
