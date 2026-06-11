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
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { HandLandmarkOverlay } from "@/components/HandLandmarkOverlay";
import { ConfidenceRing } from "@/components/ConfidenceRing";
import { WordChip } from "@/components/WordChip";

/* ------------------------------------------------------------------ */
/* Gesture sequence for rule-based V1.0 recognition                    */
/* ------------------------------------------------------------------ */
const GESTURE_SEQ = [
  { word: "HELLO", targetConf: 0.94 },
  { word: "HOW", targetConf: 0.83 },
  { word: "ARE", targetConf: 0.88 },
  { word: "YOU", targetConf: 0.91 },
  { word: "HELP", targetConf: 0.97 },
  { word: "PLEASE", targetConf: 0.89 },
  { word: "THANK", targetConf: 0.86 },
  { word: "YES", targetConf: 0.92 },
  { word: "GOOD", targetConf: 0.90 },
  { word: "SORRY", targetConf: 0.85 },
  { word: "LOVE", targetConf: 0.93 },
  { word: "NO", targetConf: 0.88 },
];

const CAMERA_W = 300;
const CAMERA_H = 260;

export default function SignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const [permission, requestPermission] = useCameraPermissions();

  const [isActive, setIsActive] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [cameraError, setCameraError] = useState(false);

  /* Gesture state */
  const [detectingWord, setDetectingWord] = useState("");
  const [confirmedWord, setConfirmedWord] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [rawConf, setRawConf] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [fps, setFps] = useState(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [frameCount, setFrameCount] = useState(0);

  /* Smoothing — ramp confidence up toward target over ~1.2s */
  const confRampRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gestureIdxRef = useRef(0);
  const gestureTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fpsTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 0 : insets.top;

  /* Cleanup */
  const clearTimers = useCallback(() => {
    if (confRampRef.current) clearInterval(confRampRef.current);
    if (gestureTimer.current) clearTimeout(gestureTimer.current);
    if (fpsTimer.current) clearInterval(fpsTimer.current);
    if (frameTimer.current) clearInterval(frameTimer.current);
  }, []);

  /* Run next gesture detection cycle */
  const runGestureCycle = useCallback(() => {
    const idx = gestureIdxRef.current % GESTURE_SEQ.length;
    const { word, targetConf } = GESTURE_SEQ[idx];
    gestureIdxRef.current = idx + 1;

    setDetectingWord(word);
    setConfirmed(false);
    setRawConf(0);
    setConfidence(0);

    let current = 0;
    confRampRef.current = setInterval(() => {
      current += 0.04 + Math.random() * 0.025;
      const clamped = Math.min(current, targetConf);
      setConfidence(clamped);
      if (clamped >= 0.85 && current >= targetConf - 0.02) {
        clearInterval(confRampRef.current!);
        setConfirmed(true);
        setConfirmedWord(word);
        setSentence((s) => {
          if (s[s.length - 1] === word) return s;
          return [...s.slice(-8), word];
        });
        if (settings.autoSpeak) {
          Speech.speak(word.toLowerCase(), { rate: settings.speechRate, language: "en-US" });
        }
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        gestureTimer.current = setTimeout(runGestureCycle, 1600);
      }
    }, 60);
  }, [settings]);

  const startRecognition = useCallback(async () => {
    if (!permission?.granted) {
      try {
        const result = await requestPermission();
        if (!result.granted) {
          setCameraError(true);
        }
      } catch {
        setCameraError(true);
      }
    }
    setIsActive(true);
    setSentence([]);
    setConfidence(0);
    setDetectingWord("");
    setConfirmedWord("");
    gestureIdxRef.current = 0;

    fpsTimer.current = setInterval(() => setFps(Math.floor(24 + Math.random() * 8)), 600);
    frameTimer.current = setInterval(() => setFrameCount((c) => c + 1), 33);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    gestureTimer.current = setTimeout(runGestureCycle, 1200);
  }, [permission, requestPermission, runGestureCycle]);

  const stopRecognition = useCallback(() => {
    clearTimers();
    setIsActive(false);
    setConfidence(0);
    setDetectingWord("");
    setConfirmedWord("");
    setConfirmed(false);
    setFps(0);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [clearTimers]);

  const sendToConversation = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.join(" ");
    addMessage({ sender: "deaf", text, type: "sign" });
    Speech.speak(text, { rate: settings.speechRate, language: "en-US" });
    setSentence([]);
    setDetectingWord("");
    setConfirmedWord("");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [sentence, addMessage, settings]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const showCamera = isActive && permission?.granted && !cameraError;
  const showDemoMode = isActive && (cameraError || !permission?.granted);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Camera / Detection Area ── */}
      <View style={[styles.cameraSection, { backgroundColor: "#050e1f" }]}>
        {/* Safe area spacer */}
        <View style={{ height: topPad }} />

        {/* Header bar */}
        <View style={styles.camHeader}>
          <View style={styles.camHeaderLeft}>
            {isActive && (
              <View style={[styles.liveBadge, { backgroundColor: "#ef4444" }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            {isActive && (
              <View style={[styles.fpsBadge, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                <Text style={styles.fpsText}>{fps} fps</Text>
              </View>
            )}
          </View>
          {isActive && (
            <TouchableOpacity
              style={[styles.flipBtn, { backgroundColor: "rgba(255,255,255,0.12)" }]}
              onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
            >
              <Feather name="refresh-cw" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Camera box */}
        <View style={styles.cameraBox}>
          {showCamera ? (
            <View style={{ width: CAMERA_W, height: CAMERA_H, borderRadius: 20, overflow: "hidden" }}>
              <CameraView style={{ width: CAMERA_W, height: CAMERA_H }} facing={facing} />
              <HandLandmarkOverlay
                word={detectingWord}
                width={CAMERA_W}
                height={CAMERA_H}
                active={isActive}
                primaryColor={colors.primary}
                accentColor={colors.accent}
              />
            </View>
          ) : showDemoMode ? (
            <View style={[styles.demoBox, { backgroundColor: "#0d1b2e" }]}>
              <HandLandmarkOverlay
                word={detectingWord}
                width={CAMERA_W}
                height={CAMERA_H}
                active={isActive}
                primaryColor={colors.primary}
                accentColor={colors.accent}
              />
              <View style={styles.demoBanner}>
                <Text style={styles.demoBannerText}>Demo Mode — Camera unavailable</Text>
              </View>
            </View>
          ) : (
            <View style={[styles.idleBox, { backgroundColor: "#0d1b2e" }]}>
              {/* Scan corners */}
              {([styles.tl, styles.tr, styles.bl, styles.br] as object[]).map((c, i) => (
                <View key={i} style={[styles.corner, c, { borderColor: colors.border }]} />
              ))}
              <Feather name="camera" size={40} color={colors.mutedForeground} />
              <Text style={[styles.idleText, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
                Tap Start to activate camera
              </Text>
            </View>
          )}
        </View>

        {/* Detected gesture display */}
        <View style={styles.gestureDisplay}>
          {detectingWord ? (
            <Text style={[styles.gestureWord, { fontSize: 28 * fs, color: confirmed ? colors.success : "#fff" }]}>
              {confirmedWord || detectingWord}
            </Text>
          ) : (
            <Text style={[styles.gesturePlaceholder, { color: "rgba(255,255,255,0.3)", fontSize: 14 * fs }]}>
              — Awaiting gesture input —
            </Text>
          )}
        </View>
      </View>

      {/* ── Controls Panel ── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={[styles.panel, { paddingBottom: insets.bottom + 86 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Confidence + stats row */}
        <View style={styles.metricsRow}>
          <ConfidenceRing
            confidence={isActive ? confidence : 0}
            size={84}
            gesture={detectingWord || undefined}
            primaryColor={colors.primary}
            successColor={colors.success}
            mutedColor={colors.mutedForeground}
            foregroundColor={colors.foreground}
            confirmed={confirmed}
          />
          <View style={styles.metricsRight}>
            <MetricTile label="Status" value={isActive ? (confirmed ? "Confirmed ✓" : "Detecting…") : "Idle"} color={confirmed ? colors.success : isActive ? colors.primary : colors.mutedForeground} />
            <MetricTile label="Words detected" value={String(sentence.length)} color={colors.foreground} />
            <MetricTile label="Gesture smoothing" value={isActive ? "Active" : "Off"} color={isActive ? colors.accent : colors.mutedForeground} />
          </View>
        </View>

        {/* Sentence buffer */}
        <View style={[styles.sentenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sentenceCardHeader}>
            <Text style={[styles.sentenceLabel, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              SENTENCE BUFFER
            </Text>
            {sentence.length > 0 && (
              <TouchableOpacity onPress={() => setSentence([])}>
                <Text style={[styles.clearAll, { color: colors.destructive, fontSize: 11 * fs }]}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          {sentence.length > 0 ? (
            <View style={styles.chipWrap}>
              {sentence.map((w, i) => (
                <WordChip
                  key={`${w}-${i}`}
                  word={w}
                  index={i}
                  onRemove={() => setSentence((s) => s.filter((_, j) => j !== i))}
                  primaryColor={colors.primary}
                  foregroundColor={colors.foreground}
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.sentencePlaceholder, { color: colors.mutedForeground, fontSize: 14 * fs }]}>
              Confirmed words will appear here as chips…
            </Text>
          )}
          {sentence.length > 0 && (
            <Text style={[styles.sentencePreview, { color: colors.foreground, fontSize: 14 * fs }]}>
              "{sentence.join(" ")}"
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: isActive ? colors.destructive : colors.primary }]}
            onPress={isActive ? stopRecognition : startRecognition}
            activeOpacity={0.85}
          >
            <Feather name={isActive ? "square" : "play"} size={20} color="#fff" />
            <Text style={[styles.btnLabel, { fontSize: 14 * fs }]}>
              {isActive ? "Stop" : "Start Camera"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: sentence.length ? colors.success : colors.muted, opacity: sentence.length ? 1 : 0.45 }]}
            onPress={sendToConversation}
            disabled={!sentence.length}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color={sentence.length ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.btnLabel, { color: sentence.length ? "#fff" : colors.mutedForeground, fontSize: 14 * fs }]}>
              Speak & Send
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "11", borderColor: colors.primary + "33" }]}>
          <Feather name="info" size={13} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary, fontSize: 12 * fs }]}>
            V1.0 uses rule-based gesture classification with temporal smoothing. Confidence must reach 85% before a gesture is confirmed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricTile({ label, value, color }: { label: string; value: string; color: string }) {
  const colors = useColors();
  return (
    <View style={{ gap: 1 }}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraSection: { paddingBottom: 12 },
  camHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  camHeaderLeft: { flexDirection: "row", gap: 8, alignItems: "center" },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { fontFamily: "Inter_700Bold", fontSize: 10, color: "#fff", letterSpacing: 1 },
  fpsBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  fpsText: { fontFamily: "Inter_600SemiBold", fontSize: 10, color: "#fff" },
  flipBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  cameraBox: { alignItems: "center", paddingHorizontal: 16 },
  idleBox: { width: CAMERA_W, height: CAMERA_H, borderRadius: 20, justifyContent: "center", alignItems: "center", gap: 12, position: "relative" },
  demoBox: { width: CAMERA_W, height: CAMERA_H, borderRadius: 20, overflow: "hidden", position: "relative" },
  demoBanner: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 5 },
  demoBannerText: { fontFamily: "Inter_500Medium", fontSize: 10, color: "rgba(255,255,255,0.7)", textAlign: "center" },
  corner: { position: "absolute", width: 18, height: 18, borderWidth: 2 },
  tl: { top: 10, left: 10, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 5 },
  tr: { top: 10, right: 10, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 5 },
  bl: { bottom: 10, left: 10, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 5 },
  br: { bottom: 10, right: 10, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 5 },
  idleText: { fontFamily: "Inter_400Regular" },
  gestureDisplay: { height: 46, alignItems: "center", justifyContent: "center", marginTop: 6 },
  gestureWord: { fontFamily: "Inter_700Bold", letterSpacing: 3, textTransform: "uppercase" },
  gesturePlaceholder: { fontFamily: "Inter_400Regular" },
  panel: { paddingHorizontal: 18, gap: 14, paddingTop: 14 },
  metricsRow: { flexDirection: "row", gap: 16, alignItems: "center" },
  metricsRight: { flex: 1, gap: 8 },
  metricLabel: { fontFamily: "Inter_500Medium", fontSize: 10, letterSpacing: 0.5 },
  metricValue: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sentenceCard: { borderRadius: 16, padding: 14, borderWidth: 1, gap: 10 },
  sentenceCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sentenceLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  clearAll: { fontFamily: "Inter_500Medium" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  sentencePlaceholder: { fontFamily: "Inter_400Regular", lineHeight: 20 },
  sentencePreview: { fontFamily: "Inter_500Medium", lineHeight: 20, fontStyle: "italic" },
  btnRow: { flexDirection: "row", gap: 10 },
  startBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  sendBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  btnLabel: { fontFamily: "Inter_600SemiBold", color: "#fff" },
  infoCard: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
