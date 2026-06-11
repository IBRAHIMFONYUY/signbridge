import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
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
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { SignAvatar } from "@/components/SignAvatar";

const DEMO_GESTURES = [
  { word: "HELLO", conf: 0.94 },
  { word: "HOW", conf: 0.81 },
  { word: "ARE", conf: 0.88 },
  { word: "YOU", conf: 0.92 },
  { word: "HELP", conf: 0.96 },
  { word: "THANK", conf: 0.87 },
  { word: "YES", conf: 0.91 },
  { word: "PLEASE", conf: 0.89 },
];

export default function SignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [fps, setFps] = useState(0);
  const [gestureIndex, setGestureIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const gestureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, []);

  const startRecognition = useCallback(() => {
    setIsActive(true);
    setCurrentGesture("");
    setConfidence(0);
    startPulse();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    fpsTimer.current = setInterval(() => {
      setFps(Math.floor(24 + Math.random() * 8));
    }, 500);

    gestureTimer.current = setInterval(() => {
      setGestureIndex((prev) => {
        const idx = (prev + 1) % DEMO_GESTURES.length;
        const g = DEMO_GESTURES[idx];
        setCurrentGesture(g.word);
        setConfidence(g.conf + (Math.random() - 0.5) * 0.08);
        if (Math.random() > 0.4) {
          setSentence((s) => [...s.slice(-6), g.word]);
        }
        return idx;
      });
    }, 1800);
  }, [startPulse]);

  const stopRecognition = useCallback(() => {
    setIsActive(false);
    stopPulse();
    if (gestureTimer.current) clearInterval(gestureTimer.current);
    if (fpsTimer.current) clearInterval(fpsTimer.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [stopPulse]);

  const sendToConversation = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.join(" ");
    addMessage({ sender: "deaf", text, type: "sign" });
    if (settings.autoSpeak) {
      Speech.speak(text, { rate: settings.speechRate });
    }
    setSentence([]);
    setCurrentGesture("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [sentence, addMessage, settings]);

  useEffect(() => {
    return () => {
      if (gestureTimer.current) clearInterval(gestureTimer.current);
      if (fpsTimer.current) clearInterval(fpsTimer.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Camera area */}
      <View
        style={[
          styles.cameraArea,
          { backgroundColor: "#0a0f1a", paddingTop: topPad },
        ]}
      >
        {/* Mock camera feed */}
        <View style={styles.cameraFeed}>
          <View style={[styles.scanCorner, styles.tl, { borderColor: colors.primary }]} />
          <View style={[styles.scanCorner, styles.tr, { borderColor: colors.primary }]} />
          <View style={[styles.scanCorner, styles.bl, { borderColor: colors.primary }]} />
          <View style={[styles.scanCorner, styles.br, { borderColor: colors.primary }]} />

          {isActive ? (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <SignAvatar word={currentGesture} size={110} />
            </Animated.View>
          ) : (
            <View style={styles.inactivePlaceholder}>
              <Feather name="camera-off" size={40} color={colors.mutedForeground} />
              <Text style={[styles.inactiveText, { color: colors.mutedForeground }]}>
                Tap start to begin
              </Text>
            </View>
          )}

          {isActive && (
            <View style={[styles.fpsBadge, { backgroundColor: colors.success + "cc" }]}>
              <Text style={styles.fpsText}>{fps} fps</Text>
            </View>
          )}
        </View>

        {/* Gesture label */}
        {currentGesture ? (
          <View style={styles.gestureRow}>
            <Text style={[styles.gestureWord, { color: "#fff", fontSize: 32 * fontSize }]}>
              {currentGesture}
            </Text>
          </View>
        ) : (
          <View style={styles.gestureRow}>
            <Text style={[styles.gesturePlaceholder, { color: "rgba(255,255,255,0.3)" }]}>
              — No gesture —
            </Text>
          </View>
        )}
      </View>

      {/* Controls panel */}
      <View
        style={[
          styles.panel,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 80 },
        ]}
      >
        <ConfidenceMeter confidence={isActive ? confidence : 0} />

        {/* Sentence buffer */}
        <View style={[styles.sentenceBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sentenceLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            SENTENCE BUFFER
          </Text>
          <Text
            style={[
              styles.sentenceText,
              { color: sentence.length ? colors.foreground : colors.mutedForeground, fontSize: 16 * fontSize },
            ]}
            numberOfLines={2}
          >
            {sentence.length ? sentence.join(" ") : "Words will appear here…"}
          </Text>
          {sentence.length > 0 && (
            <TouchableOpacity onPress={() => setSentence([])} style={styles.clearBtn}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: isActive ? colors.destructive : colors.primary },
            ]}
            onPress={isActive ? stopRecognition : startRecognition}
            activeOpacity={0.85}
          >
            <Feather name={isActive ? "square" : "play"} size={22} color="#fff" />
            <Text style={[styles.btnText, { fontSize: 14 * fontSize }]}>
              {isActive ? "Stop" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: sentence.length ? colors.success : colors.muted,
                borderColor: sentence.length ? colors.success : colors.border,
              },
            ]}
            onPress={sendToConversation}
            disabled={sentence.length === 0}
            activeOpacity={0.85}
          >
            <Feather name="send" size={18} color={sentence.length ? "#fff" : colors.mutedForeground} />
            <Text
              style={[
                styles.sendText,
                { color: sentence.length ? "#fff" : colors.mutedForeground, fontSize: 13 * fontSize },
              ]}
            >
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  cameraFeed: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  scanCorner: { position: "absolute", width: 22, height: 22, borderWidth: 3 },
  tl: { top: 6, left: 6, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  tr: { top: 6, right: 6, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bl: { bottom: 6, left: 6, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  br: { bottom: 6, right: 6, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  inactivePlaceholder: { alignItems: "center", gap: 10 },
  inactiveText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  fpsBadge: { position: "absolute", top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  fpsText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
  gestureRow: { marginTop: 16, height: 50, justifyContent: "center" },
  gestureWord: { fontFamily: "Inter_700Bold", letterSpacing: 2, textTransform: "uppercase" },
  gesturePlaceholder: { fontSize: 16, fontFamily: "Inter_400Regular" },
  panel: { padding: 20, gap: 16 },
  sentenceBox: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    minHeight: 70,
    position: "relative",
  },
  sentenceLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 6 },
  sentenceText: { fontFamily: "Inter_500Medium", lineHeight: 22 },
  clearBtn: { position: "absolute", top: 12, right: 12 },
  btnRow: { flexDirection: "row", gap: 12 },
  mainBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { fontFamily: "Inter_600SemiBold", color: "#fff" },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  sendText: { fontFamily: "Inter_600SemiBold" },
});
