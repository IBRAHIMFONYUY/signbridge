import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const QUICK_SIGNS = ["HELLO", "HELP", "THANK", "YES", "NO", "PLEASE", "SORRY", "GOOD"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { messages, settings } = useApp();
  const fontSize = settings.largeText ? 1.2 : 1;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.primary, fontSize: 28 * fontSize }]}>
            SignBridge
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontSize: 13 * fontSize }]}>
            Breaking communication barriers
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
      </View>

      {/* Mode cards */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeCard, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/(tabs)/sign")}
          activeOpacity={0.85}
        >
          <View style={[styles.modeIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="camera" size={26} color="#fff" />
          </View>
          <Text style={[styles.modeTitle, { color: "#fff", fontSize: 15 * fontSize }]}>Sign Mode</Text>
          <Text style={[styles.modeSub, { color: "rgba(255,255,255,0.8)", fontSize: 12 * fontSize }]}>
            Camera → Text → Voice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}
          onPress={() => router.push("/(tabs)/speech")}
          activeOpacity={0.85}
        >
          <View style={[styles.modeIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="mic" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.modeTitle, { color: colors.foreground, fontSize: 15 * fontSize }]}>Speech Mode</Text>
          <Text style={[styles.modeSub, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
            Voice → Text → Signs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conversation shortcut */}
      <TouchableOpacity
        style={[styles.conversationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/(tabs)/conversation")}
        activeOpacity={0.85}
      >
        <View style={[styles.convLeft, { backgroundColor: colors.accent + "22", borderRadius: 12, padding: 10 }]}>
          <Feather name="message-circle" size={24} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.convTitle, { color: colors.foreground, fontSize: 15 * fontSize }]}>
            Live Conversation
          </Text>
          <Text style={[styles.convSub, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
            {messages.length > 0 ? `${messages.length} messages` : "Start a new conversation"}
          </Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Quick signs */}
      <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 14 * fontSize }]}>
        Common Signs
      </Text>
      <View style={styles.signGrid}>
        {QUICK_SIGNS.map((sign) => (
          <View
            key={sign}
            style={[styles.signChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Text style={[styles.signText, { color: colors.foreground, fontSize: 13 * fontSize }]}>
              {sign}
            </Text>
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: "Messages", value: messages.length, icon: "message-square" as const },
          { label: "Signs", value: messages.filter((m) => m.type === "sign").length, icon: "activity" as const },
          { label: "Speech", value: messages.filter((m) => m.type === "speech").length, icon: "mic" as const },
        ].map((stat) => (
          <View
            key={stat.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={stat.icon} size={16} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground, fontSize: 22 * fontSize }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  brand: { fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline: { fontFamily: "Inter_400Regular", marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 8 },
  modeRow: { flexDirection: "row", gap: 12 },
  modeCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  modeIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  modeTitle: { fontFamily: "Inter_600SemiBold" },
  modeSub: { fontFamily: "Inter_400Regular", lineHeight: 16 },
  conversationCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
  },
  convLeft: {},
  convTitle: { fontFamily: "Inter_600SemiBold" },
  convSub: { fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  signGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  signChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  signText: { fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
  },
  statValue: { fontFamily: "Inter_700Bold" },
  statLabel: { fontFamily: "Inter_400Regular" },
});
