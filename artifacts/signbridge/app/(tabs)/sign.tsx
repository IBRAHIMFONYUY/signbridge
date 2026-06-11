import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { WordChip } from "@/components/WordChip";
import { CameraDetector } from "@/components/CameraDetector";

const CAMERA_W = 320;
const CAMERA_H = 270;

/* Friendly labels for gestures */
const GESTURE_LABELS: Record<string, string> = {
  HELLO: "Hello / Open Hand",
  YES: "Yes / Fist",
  HELP: "Point / Help",
  PEACE: "Peace / V",
  GOOD: "Thumbs Up / Good",
  LOVE: "ILY / Love",
  CALL: "Call Me",
  I: "Letter I / Pinky",
  THREE: "3 / Three",
  FOUR: "4 / Four",
};

export default function SignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();

  const [isActive, setIsActive] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [fps, setFps] = useState(0);
  const [isReady, setIsReady] = useState(false);

  /* Gesture state */
  const [currentGesture, setCurrentGesture] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [sentence, setSentence] = useState<string[]>([]);
  const lastConfirmedRef = useRef("");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Confidence animation */
  const confAnim = useRef(new Animated.Value(0)).current;
  const confirmScale = useRef(new Animated.Value(1)).current;

  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  /* ── Handle real gesture output from CameraDetector ── */
  const handleGesture = useCallback(
    (gesture: string, conf: number, isConfirmed: boolean) => {
      setCurrentGesture(gesture);
      setConfidence(conf);
      setConfirmed(isConfirmed);

      Animated.spring(confAnim, {
        toValue: conf,
        useNativeDriver: false,
        tension: 50,
        friction: 12,
      }).start();

      if (isConfirmed && gesture && gesture !== lastConfirmedRef.current) {
        lastConfirmedRef.current = gesture;

        // Pulse animation on confirmation
        Animated.sequence([
          Animated.spring(confirmScale, { toValue: 1.08, useNativeDriver: true, tension: 100 }),
          Animated.spring(confirmScale, { toValue: 1, useNativeDriver: true, tension: 80 }),
        ]).start();

        // Add to sentence buffer
        setSentence((s) => {
          if (s[s.length - 1] === gesture) return s;
          return [...s.slice(-9), gesture];
        });

        // Auto-speak the word
        if (settings.autoSpeak) {
          const label = GESTURE_LABELS[gesture] ?? gesture;
          Speech.speak(label.split(" / ")[0].toLowerCase(), {
            rate: settings.speechRate,
            language: "en-US",
          });
        }

        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        // Reset so the same gesture can be re-detected after 1.5s hold
        holdTimer.current = setTimeout(() => {
          lastConfirmedRef.current = "";
        }, 1500);
      }
    },
    [settings, confAnim, confirmScale]
  );

  const handleError = useCallback((msg: string) => {
    console.warn("CameraDetector:", msg);
  }, []);

  const startCamera = useCallback(() => {
    setSentence([]);
    setConfidence(0);
    setCurrentGesture("");
    setConfirmed(false);
    setIsReady(false);
    lastConfirmedRef.current = "";
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(true);
  }, []);

  const stopCamera = useCallback(() => {
    setIsActive(false);
    setCurrentGesture("");
    setConfidence(0);
    setConfirmed(false);
    setFps(0);
    setIsReady(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const sendSentence = useCallback(() => {
    if (!sentence.length) return;
    const text = sentence.map((g) => GESTURE_LABELS[g]?.split(" / ")[0] ?? g).join(" ");
    addMessage({ sender: "deaf", text, type: "sign" });
    Speech.speak(text, { rate: settings.speechRate, language: "en-US" });
    setSentence([]);
    lastConfirmedRef.current = "";
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [sentence, addMessage, settings]);

  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  const gestureLabel = currentGesture ? GESTURE_LABELS[currentGesture] ?? currentGesture : "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Camera section ── */}
      <View style={[styles.cameraSection, { backgroundColor: "#050e1f" }]}>
        <View style={{ height: topPad }} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {isActive && isReady && (
              <View style={[styles.liveBadge, { backgroundColor: "#dc2626" }]}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            {isActive && isReady && fps > 0 && (
              <View style={[styles.fpsBadge, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Text style={styles.fpsText}>{fps} fps · MediaPipe</Text>
              </View>
            )}
            {isActive && !isReady && (
              <View style={[styles.fpsBadge, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                <Text style={styles.fpsText}>Loading model…</Text>
              </View>
            )}
          </View>
          {isActive && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]}
              onPress={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            >
              <Feather name="refresh-cw" size={15} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Camera + overlay */}
        <View style={styles.cameraWrap}>
          {!isActive ? (
            /* Idle state */
            <View style={[styles.idleBox, { borderColor: colors.border + "44" }]}>
              {(["tl", "tr", "bl", "br"] as const).map((c) => (
                <View key={c} style={[styles.corner, styles[c], { borderColor: colors.primary + "88" }]} />
              ))}
              <View style={[styles.idleIconWrap, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="camera" size={30} color={colors.primary} />
              </View>
              <Text style={[styles.idleTitle, { color: "#fff", fontSize: 15 * fs }]}>
                MediaPipe Hands ready
              </Text>
              <Text style={[styles.idleSub, { color: "rgba(255,255,255,0.45)", fontSize: 11 * fs }]}>
                Real-time 21-point landmark tracking
              </Text>
            </View>
          ) : (
            /* Live camera + landmark overlay */
            <Animated.View style={{ transform: [{ scale: confirmScale }] }}>
              <CameraDetector
                active={isActive}
                facing={facing}
                width={CAMERA_W}
                height={CAMERA_H}
                primaryColor={colors.primary}
                accentColor={colors.accent}
                onGesture={handleGesture}
                onFps={setFps}
                onError={handleError}
                onReady={() => setIsReady(true)}
              />
            </Animated.View>
          )}
        </View>

        {/* Detected gesture display */}
        <View style={styles.gestureRow}>
          {currentGesture ? (
            <>
              <View style={[styles.gestureDot, { backgroundColor: confirmed ? colors.success : colors.primary }]} />
              <Text
                style={[
                  styles.gestureText,
                  { color: confirmed ? colors.success : "#fff", fontSize: 20 * fs },
                ]}
              >
                {gestureLabel}
              </Text>
            </>
          ) : (
            <Text style={[styles.gesturePlaceholder, { color: "rgba(255,255,255,0.3)", fontSize: 13 * fs }]}>
              {isActive && isReady ? "Show your hand to the camera…" : "— Awaiting gesture input —"}
            </Text>
          )}
        </View>
      </View>

      {/* ── Controls panel ── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[styles.panel, { paddingBottom: insets.bottom + 86 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metrics */}
        <View style={styles.metricsRow}>
          <ConfidenceRing
            confidence={isActive ? confidence : 0}
            size={86}
            gesture={currentGesture || undefined}
            primaryColor={colors.primary}
            successColor={colors.success}
            mutedColor={colors.mutedForeground}
            foregroundColor={colors.foreground}
            confirmed={confirmed}
          />
          <View style={styles.metricsRight}>
            <MetricRow
              label="Status"
              value={
                !isActive ? "Idle"
                  : !isReady ? "Loading model…"
                  : confirmed ? "Confirmed ✓"
                  : "Detecting…"
              }
              color={
                !isActive ? colors.mutedForeground
                  : !isReady ? colors.warning
                  : confirmed ? colors.success
                  : colors.primary
              }
            />
            <MetricRow label="Words" value={String(sentence.length)} color={colors.foreground} />
            <MetricRow label="Engine" value="MediaPipe Hands" color={colors.accent} />
            <MetricRow label="Landmarks" value={isActive && isReady ? "21 pts · live" : "—"} color={colors.mutedForeground} />
          </View>
        </View>

        {/* Sentence buffer */}
        <View style={[styles.sentenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sentenceHead}>
            <Text style={[styles.sentenceLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>
              SENTENCE BUFFER
            </Text>
            {sentence.length > 0 && (
              <TouchableOpacity onPress={() => setSentence([])}>
                <Text style={[styles.clearAll, { color: colors.destructive, fontSize: 11 * fs }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {sentence.length > 0 ? (
            <>
              <View style={styles.chipWrap}>
                {sentence.map((g, i) => (
                  <WordChip
                    key={`${g}-${i}`}
                    word={GESTURE_LABELS[g]?.split(" / ")[0] ?? g}
                    index={i}
                    onRemove={() => setSentence((s) => s.filter((_, j) => j !== i))}
                    primaryColor={colors.primary}
                    foregroundColor={colors.foreground}
                  />
                ))}
              </View>
              <Text style={[styles.sentencePreview, { color: colors.foreground, fontSize: 14 * fs }]}>
                "{sentence.map((g) => GESTURE_LABELS[g]?.split(" / ")[0] ?? g).join(" ")}"
              </Text>
            </>
          ) : (
            <Text style={[styles.sentencePlaceholder, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
              Confirmed gestures appear here as chips…
            </Text>
          )}
        </View>

        {/* Gesture reference */}
        {!isActive && (
          <View style={[styles.refCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.refTitle, { color: colors.foreground, fontSize: 12 * fs }]}>Supported Gestures</Text>
            <View style={styles.refGrid}>
              {Object.entries(GESTURE_LABELS).map(([key, label]) => (
                <View key={key} style={[styles.refChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33" }]}>
                  <Text style={[styles.refChipText, { color: colors.primary, fontSize: 10 * fs }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: isActive ? colors.destructive : colors.primary }]}
            onPress={isActive ? stopCamera : startCamera}
            activeOpacity={0.85}
          >
            <Feather name={isActive ? "square" : "play"} size={18} color="#fff" />
            <Text style={[styles.btnLabel, { fontSize: 14 * fs }]}>
              {isActive ? "Stop" : "Start Camera"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: sentence.length ? colors.success : colors.muted,
                opacity: sentence.length ? 1 : 0.4,
              },
            ]}
            onPress={sendSentence}
            disabled={!sentence.length}
            activeOpacity={0.85}
          >
            <Feather name="send" size={16} color={sentence.length ? "#fff" : colors.mutedForeground} />
            <Text
              style={[styles.btnLabel, { color: sentence.length ? "#fff" : colors.mutedForeground, fontSize: 14 * fs }]}
            >
              Speak & Send
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="cpu" size={13} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary, fontSize: 11 * fs }]}>
            Uses MediaPipe Hands (CDN) — 21 landmark keypoints, multi-frame temporal smoothing, 65% detection confidence threshold.
            {Platform.OS !== "web" ? " Full ML detection available on web." : ""}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={styles.metricRow}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraSection: { paddingBottom: 10 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#fff", letterSpacing: 1 },
  fpsBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  fpsText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.8)" },
  iconBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  cameraWrap: { alignItems: "center", paddingHorizontal: 16, minHeight: CAMERA_H },
  idleBox: {
    width: CAMERA_W,
    height: CAMERA_H,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    position: "relative",
    backgroundColor: "#0a1628",
  },
  corner: { position: "absolute", width: 20, height: 20, borderWidth: 2 },
  tl: { top: 12, left: 12, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 5 },
  tr: { top: 12, right: 12, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 5 },
  bl: { bottom: 12, left: 12, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 5 },
  br: { bottom: 12, right: 12, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 5 },
  idleIconWrap: { width: 60, height: 60, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  idleTitle: { fontFamily: "Inter_600SemiBold" },
  idleSub: { fontFamily: "Inter_400Regular" },
  gestureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  gestureDot: { width: 8, height: 8, borderRadius: 4 },
  gestureText: { fontFamily: "Inter_700Bold", letterSpacing: 1 },
  gesturePlaceholder: { fontFamily: "Inter_400Regular" },
  panel: { paddingHorizontal: 18, paddingTop: 14, gap: 14 },
  metricsRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  metricsRight: { flex: 1, gap: 6 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metricLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 0.4 },
  metricValue: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  sentenceCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 10 },
  sentenceHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sentenceLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  clearAll: { fontFamily: "Inter_500Medium" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  sentencePlaceholder: { fontFamily: "Inter_400Regular", lineHeight: 19 },
  sentencePreview: { fontFamily: "Inter_500Medium", lineHeight: 20, fontStyle: "italic" },
  refCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 10 },
  refTitle: { fontFamily: "Inter_600SemiBold" },
  refGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  refChip: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  refChipText: { fontFamily: "Inter_500Medium" },
  btnRow: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
  },
  btnLabel: { fontFamily: "Inter_600SemiBold", color: "#fff" },
  infoBanner: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: { flex: 1, fontFamily: "Inter_400Regular", lineHeight: 17 },
});
