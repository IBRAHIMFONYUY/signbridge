import React, { useCallback } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const SPEED_OPTIONS: { val: number; label: string }[] = [
  { val: 0.75, label: "Slow" },
  { val: 1.0, label: "Normal" },
  { val: 1.25, label: "Fast" },
  { val: 1.5, label: "Rapid" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useApp();
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggle = useCallback((key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] } as any);
  }, [settings, updateSettings]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart + "cc", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: "#fff", fontSize: 22 * fs }]}>Settings</Text>
        <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.7)", fontSize: 13 * fs }]}>
          Personalise your SignBridge experience
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Accessibility */}
        <SectionLabel label="ACCESSIBILITY" colors={colors} fs={fs} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="type" label="Large Text" sub="Scale up text throughout the app"
            value={settings.largeText} onToggle={() => toggle("largeText")}
            colors={colors} fs={fs}
          />
          <ToggleRow
            icon="sun" label="High Contrast" sub="Boost contrast for low vision"
            value={settings.highContrast} onToggle={() => toggle("highContrast")}
            colors={colors} fs={fs}
          />
          <ToggleRow
            icon="moon" label="Dark Mode" sub="Easier on the eyes, especially at night"
            value={settings.darkMode} onToggle={() => toggle("darkMode")}
            colors={colors} fs={fs} last
          />
        </View>

        {/* Speech & TTS */}
        <SectionLabel label="SPEECH & TTS" colors={colors} fs={fs} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ToggleRow
            icon="volume-2" label="Auto-Speak" sub="Speak detected signs aloud automatically"
            value={settings.autoSpeak} onToggle={() => toggle("autoSpeak")}
            colors={colors} fs={fs}
          />
          {/* Speech Rate */}
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="fast-forward" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.rowLabel, { color: colors.foreground, fontSize: 14 * fs }]}>Speech Rate</Text>
              <Text style={[styles.rowSub, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
                {SPEED_OPTIONS.find((s) => s.val === settings.speechRate)?.label ?? "Normal"}
              </Text>
              <View style={styles.speedRow}>
                {SPEED_OPTIONS.map(({ val, label }) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => updateSettings({ speechRate: val })}
                    style={[
                      styles.speedChip,
                      {
                        backgroundColor: settings.speechRate === val ? colors.primary : colors.muted,
                        borderColor: settings.speechRate === val ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.speedLabel, { color: settings.speechRate === val ? "#fff" : colors.mutedForeground, fontSize: 11 * fs }]}>
                      {val}×
                    </Text>
                    <Text style={[styles.speedSub, { color: settings.speechRate === val ? "rgba(255,255,255,0.75)" : colors.mutedForeground, fontSize: 9 * fs }]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Recognition */}
        <SectionLabel label="RECOGNITION (V1.0)" colors={colors} fs={fs} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "shield" as const, label: "Gesture smoothing", value: "Enabled — 60 frames/s" },
            { icon: "cpu" as const, label: "Recognition engine", value: "Rule-based classifier" },
            { icon: "target" as const, label: "Confidence threshold", value: "85% — gesture confirmed" },
            { icon: "layers" as const, label: "Landmarks tracked", value: "21 hand keypoints" },
            { icon: "clock" as const, label: "Confirmation window", value: "~1.2 s ramp-up" },
          ].map(({ icon, label, value }, i, arr) => (
            <View
              key={label}
              style={[styles.infoRow, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.accent + "22" }]}>
                <Feather name={icon} size={15} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground, fontSize: 13 * fs }]}>{label}</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground, fontSize: 12 * fs }]}>{value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* About */}
        <SectionLabel label="ABOUT" colors={colors} fs={fs} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "info" as const, label: "Version", value: "1.0.0" },
            { icon: "shield" as const, label: "Privacy", value: "All data stays on device" },
            { icon: "wifi-off" as const, label: "Offline support", value: "Core features work offline" },
            { icon: "code" as const, label: "Next: Version 2.0", value: "Speech Recognition + Profiles" },
          ].map(({ icon, label, value }, i, arr) => (
            <View
              key={label}
              style={[styles.infoRow, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0 }]}
            >
              <Feather name={icon} size={15} color={colors.mutedForeground} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground, fontSize: 13 * fs }]}>{label}</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground, fontSize: 12 * fs }]}>{value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SectionLabel({ label, colors, fs }: { label: string; colors: any; fs: number }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontSize: 11 * fs }]}>{label}</Text>
  );
}

function ToggleRow({ icon, label, sub, value, onToggle, colors, fs, last }: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string; sub: string; value: boolean; onToggle: () => void;
  colors: any; fs: number; last?: boolean;
}) {
  return (
    <View style={[styles.row, { borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + "22" }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontSize: 14 * fs }]}>{label}</Text>
        <Text style={[styles.rowSub, { color: colors.mutedForeground, fontSize: 12 * fs }]}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingBottom: 24, gap: 6 },
  headerTitle: { fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  headerSub: { fontFamily: "Inter_400Regular" },
  body: { paddingHorizontal: 18, gap: 8, paddingTop: 4 },
  sectionLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginTop: 10, marginLeft: 2 },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowLabel: { fontFamily: "Inter_500Medium" },
  rowSub: { fontFamily: "Inter_400Regular", marginTop: 1 },
  speedRow: { flexDirection: "row", gap: 7, marginTop: 10, flexWrap: "wrap" },
  speedChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, alignItems: "center", minWidth: 52 },
  speedLabel: { fontFamily: "Inter_700Bold" },
  speedSub: { fontFamily: "Inter_400Regular" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
});
