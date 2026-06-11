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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const V1_FEATURES = [
  { icon: "camera" as const, label: "Hand Sign Recognition", done: true },
  { icon: "type" as const, label: "Text Output", done: true },
  { icon: "volume-2" as const, label: "Speech Output (TTS)", done: true },
  { icon: "zap" as const, label: "Modern UI", done: true },
  { icon: "activity" as const, label: "Gesture Smoothing", done: true },
];

const QUICK_ACTIONS = [
  { label: "Sign Mode", sub: "Camera → Text → Voice", icon: "camera" as const, route: "/(tabs)/sign" as const, primary: true },
  { label: "Speech Mode", sub: "Voice → Text → Signs", icon: "mic" as const, route: "/(tabs)/speech" as const, primary: false },
  { label: "Conversation", sub: "Live bidirectional chat", icon: "message-circle" as const, route: "/(tabs)/conversation" as const, primary: false },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { messages, settings } = useApp();
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const deafMsgs = messages.filter((m) => m.sender === "deaf").length;
  const hearingMsgs = messages.filter((m) => m.sender === "hearing").length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero gradient header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, colors.background]}
        locations={[0, 0.6, 1]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.heroInner}>
          <View style={[styles.logoBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="activity" size={22} color="#fff" />
          </View>
          <Text style={[styles.heroTitle, { fontSize: 32 * fs }]}>SignBridge</Text>
          <Text style={[styles.heroTagline, { fontSize: 14 * fs }]}>
            Breaking communication barriers{"\n"}between deaf, mute & hearing individuals
          </Text>
          {/* Live status */}
          <View style={[styles.statusRow, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <View style={styles.statusDot} />
            <Text style={[styles.statusText, { fontSize: 12 * fs }]}>V1.0 — All systems active</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Quick actions */}
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => router.push(a.route)}
              activeOpacity={0.82}
              style={[
                styles.actionCard,
                a.primary
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                a.primary ? styles.actionCardFull : styles.actionCardHalf,
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: a.primary ? "rgba(255,255,255,0.2)" : colors.primary + "22" },
                ]}
              >
                <Feather name={a.icon} size={22} color={a.primary ? "#fff" : colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: a.primary ? "#fff" : colors.foreground, fontSize: 15 * fs }]}>
                {a.label}
              </Text>
              <Text style={[styles.actionSub, { color: a.primary ? "rgba(255,255,255,0.75)" : colors.mutedForeground, fontSize: 11 * fs }]}>
                {a.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 13 * fs }]}>Session Stats</Text>
          <View style={styles.statsRow}>
            {[
              { val: messages.length, label: "Messages", icon: "message-square" as const },
              { val: deafMsgs, label: "Signs sent", icon: "camera" as const },
              { val: hearingMsgs, label: "Speech sent", icon: "mic" as const },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Feather name={s.icon} size={14} color={colors.primary} />
                <Text style={[styles.statVal, { color: colors.foreground, fontSize: 22 * fs }]}>{s.val}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* V1.0 Feature checklist */}
        <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.featureHeader}>
            <View style={[styles.versionBadge, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.versionText, { color: colors.primary, fontSize: 10 * fs }]}>VERSION 1.0</Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 13 * fs }]}>Release Features</Text>
          </View>
          {V1_FEATURES.map((f) => (
            <View key={f.label} style={[styles.featureRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.success + "22" }]}>
                <Feather name={f.icon} size={14} color={colors.success} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.foreground, fontSize: 13 * fs }]}>{f.label}</Text>
              <View style={[styles.checkBadge, { backgroundColor: colors.success + "22" }]}>
                <Feather name="check" size={12} color={colors.success} />
              </View>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 13 * fs, marginBottom: 12 }]}>
            How SignBridge Works
          </Text>
          {[
            { icon: "camera" as const, color: colors.primary, title: "Deaf User Signs", body: "Point the camera at your hand. SignBridge detects your gesture in real-time." },
            { icon: "zap" as const, color: colors.accent, title: "AI Translates", body: "The engine classifies the sign and builds a sentence with smoothing." },
            { icon: "volume-2" as const, color: colors.success, title: "Hearing User Hears", body: "The translated sentence is spoken aloud via text-to-speech output." },
            { icon: "mic" as const, color: colors.warning, title: "Hearing User Speaks", body: "Microphone captures speech. The avatar signs back to the deaf user." },
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={[styles.howNum, { backgroundColor: step.color + "22", borderColor: step.color + "55" }]}>
                <Text style={[styles.howNumText, { color: step.color }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.howTitle, { color: colors.foreground, fontSize: 13 * fs }]}>{step.title}</Text>
                <Text style={[styles.howBody, { color: colors.mutedForeground, fontSize: 12 * fs }]}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 32, paddingHorizontal: 24 },
  heroInner: { alignItems: "center", gap: 12 },
  logoBadge: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  heroTitle: { fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 },
  heroTagline: { fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 22 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#4ade80" },
  statusText: { fontFamily: "Inter_500Medium", color: "#fff" },
  body: { paddingHorizontal: 18, gap: 16, marginTop: -4 },
  actionsGrid: { gap: 10 },
  actionCard: { borderRadius: 20, padding: 18, gap: 8 },
  actionCardFull: {},
  actionCardHalf: {},
  actionIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  actionLabel: { fontFamily: "Inter_600SemiBold" },
  actionSub: { fontFamily: "Inter_400Regular", lineHeight: 16 },
  statsCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 12 },
  statsRow: { flexDirection: "row" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { fontFamily: "Inter_700Bold" },
  statLabel: { fontFamily: "Inter_400Regular" },
  featuresCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 0 },
  featureHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  versionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  versionText: { fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  featureIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  featureLabel: { fontFamily: "Inter_500Medium", flex: 1 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  howCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 14 },
  howStep: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  howNum: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", borderWidth: 1, flexShrink: 0 },
  howNumText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  howTitle: { fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  howBody: { fontFamily: "Inter_400Regular", lineHeight: 18 },
  sectionTitle: { fontFamily: "Inter_600SemiBold" },
});
