import React, { useCallback } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5] as const;
const SPEED_LABELS: Record<number, string> = {
  0.75: "Slow",
  1.0: "Normal",
  1.25: "Fast",
  1.5: "Very fast",
};

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useApp();
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const toggle = useCallback(
    (key: keyof typeof settings) => {
      updateSettings({ [key]: !settings[key] } as any);
    },
    [settings, updateSettings]
  );

  function SettingRow({
    icon,
    title,
    subtitle,
    value,
    onToggle,
  }: {
    icon: React.ComponentProps<typeof Feather>["name"];
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
  }) {
    return (
      <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
        <View style={[styles.settingIcon, { backgroundColor: colors.primary + "22" }]}>
          <Feather name={icon} size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.settingTitle, { color: colors.foreground, fontSize: 15 * fontSize }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
              {subtitle}
            </Text>
          )}
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Accessibility */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
        ACCESSIBILITY
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="type"
          title="Large Text"
          subtitle="Increase text size throughout the app"
          value={settings.largeText}
          onToggle={() => toggle("largeText")}
        />
        <SettingRow
          icon="sun"
          title="High Contrast"
          subtitle="Improve visibility for low vision"
          value={settings.highContrast}
          onToggle={() => toggle("highContrast")}
        />
        <SettingRow
          icon="moon"
          title="Dark Mode"
          subtitle="Reduce eye strain"
          value={settings.darkMode}
          onToggle={() => toggle("darkMode")}
        />
      </View>

      {/* Speech */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
        SPEECH
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SettingRow
          icon="volume-2"
          title="Auto-Speak"
          subtitle="Automatically speak translated sign language"
          value={settings.autoSpeak}
          onToggle={() => toggle("autoSpeak")}
        />
        <View style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: 0 }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="fast-forward" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, { color: colors.foreground, fontSize: 15 * fontSize }]}>
              Speech Rate
            </Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
              {SPEED_LABELS[settings.speechRate] ?? "Normal"}
            </Text>
          </View>
          <View style={styles.speedRow}>
            {SPEED_OPTIONS.map((speed) => (
              <TouchableOpacity
                key={speed}
                onPress={() => updateSettings({ speechRate: speed })}
                style={[
                  styles.speedBtn,
                  {
                    backgroundColor:
                      settings.speechRate === speed ? colors.primary : colors.muted,
                    borderColor:
                      settings.speechRate === speed ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.speedText,
                    {
                      color:
                        settings.speechRate === speed ? "#fff" : colors.mutedForeground,
                      fontSize: 11 * fontSize,
                    },
                  ]}
                >
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* About */}
      <Text style={[styles.sectionHeader, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
        ABOUT
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "info" as const, label: "SignBridge v1.0.0" },
          { icon: "shield" as const, label: "Privacy: all data stays on device" },
          { icon: "wifi-off" as const, label: "Core features work offline" },
        ].map(({ icon, label }) => (
          <View key={label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Feather name={icon} size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground, fontSize: 13 * fontSize }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 10 },
  sectionHeader: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  settingTitle: { fontFamily: "Inter_500Medium" },
  settingSubtitle: { fontFamily: "Inter_400Regular" },
  speedRow: { flexDirection: "row", gap: 5 },
  speedBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  speedText: { fontFamily: "Inter_600SemiBold" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoText: { fontFamily: "Inter_400Regular" },
});
