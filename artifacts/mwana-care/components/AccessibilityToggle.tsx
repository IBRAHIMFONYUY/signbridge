import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Icon } from "./Icon";

export function AccessibilityToggle() {
  const colors = useColors();
  const { signBridgeEnabled, setSignBridgeEnabled } = useMwana();
  
  return (
    <TouchableOpacity
      onPress={() => setSignBridgeEnabled(!signBridgeEnabled)}
      style={[styles.container, { backgroundColor: signBridgeEnabled ? colors.primary + "22" : colors.card, borderColor: signBridgeEnabled ? colors.primary : colors.border }]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: signBridgeEnabled ? colors.primary : colors.muted }]}>
        <Icon name="users" size={20} color={signBridgeEnabled ? "#fff" : colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.foreground }]}>SignBridge Mode</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {signBridgeEnabled ? "Sign language enabled" : "Tap to enable sign language"}
        </Text>
      </View>
      <View style={[styles.indicator, { backgroundColor: signBridgeEnabled ? colors.primary : colors.muted }]}>
        <View style={[styles.indicatorDot, { backgroundColor: signBridgeEnabled ? "#fff" : colors.mutedForeground }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  indicator: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  indicatorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
