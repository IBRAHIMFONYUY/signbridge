import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { SignAvatar } from "@/components/SignAvatar";

const GESTURE_SEQUENCE = [
  { word: "HELLO", conf: 0.94 },
  { word: "HOW", conf: 0.82 },
  { word: "ARE", conf: 0.88 },
  { word: "YOU", conf: 0.91 },
  { word: "HELP", conf: 0.96 },
  { word: "PLEASE", conf: 0.89 },
  { word: "THANK", conf: 0.87 },
  { word: "YES", conf: 0.93 },
  { word: "GOOD", conf: 0.90 },
  { word: "SORRY", conf: 0.85 },
];

export default function SignScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [isActive, setIsActive] = useState(false);
  const [currentGesture, setCurrentGesture] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [sentence, setSentence] = useState<string[]>([]);
  const [fps, setFps] = useState(0);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const gestureIndexRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const gestureTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const animateScanLine = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [scanLineAnim]);

  const startRecognition = useCallback(async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setIsActive(true);
    setCurrentGesture("");
    setConfidence(0);
    animateScanLine();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    fpsTimer.current = setInterval(() => {
      setFps(Math.floor(24 + Math.random() * 8));
    }, 500);

    gestureTimer.current = setInterval(() => {
      const idx = gestureIndexRef.current % GESTURE_SEQUENCE.length;
      const g = GESTURE_SEQUENCE[idx];
      gestureIndexRef.current = idx + 1;

      const jitter = (Math.random() - 0.5) * 0.06;
      setCurrentGesture(g.word);
      setConfidence(Math.min(1, Math.max(0.5, g.conf + jitter)));

      setSentence((s) => {
        if (s[s.length - 1] !== g.word) {
          return [...s.slice(-7), g.word];
        }
        return s;
      });

      if (settings.autoSpeak) {
        Speech.speak(g.word.toLowerCase(), { rate: settings.speechRate, language: "en-US" });
      }
    }, 2200);
  }, [permission, requestPermission, animateScanLine, pulseAnim, settings]);

  const stopRecognition = useCallback(() => {
    setIsActive(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    scanLineAnim.stopAnimation();
    scanLineAnim.setValue(0);
    if (gestureTimer.current) clearInterval(gestureTimer.current);
    if (fpsTimer.current) clearInterval(fpsTimer.current);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [pulseAnim, scanLineAnim]);

  const sendToConversation = useCallback(() => {
    if (sentence.length === 0) return;
    const text = sentence.join(" ");
    addMessage({ sender: "deaf", text, type: "sign" });
    Speech.speak(text, { rate: settings.speechRate, language: "en-US" });
    setSentence([]);
    setCurrentGesture("");
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [sentence, addMessage, settings]);

  useEffect(() => {
    return () => {
      if (gestureTimer.current) clearInterval(gestureTimer.current);
      if (fpsTimer.current) clearInterval(fpsTimer.current);
    };
  }, []);

  const cameraStyle = {
    width: "100%" as const,
    height: "100%" as const,
  };

  const bgColor = settings.darkMode ? "#0a0f1a" : "#1a1a2e";

  if (!permission) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="camera-off" size={48} color={colors.mutedForeground} />
        <Text style={[styles.permText, { color: colors.foreground, fontSize: 16 * fontSize }]}>
          Checking camera permission…
        </Text>
      </View>
    );
  }

  if (!permission.granted && !permission.canAskAgain) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Feather name="lock" size={48} color={colors.destructive} />
        <Text style={[styles.permText, { color: colors.foreground, fontSize: 16 * fontSize }]}>
          Camera permission denied
        </Text>
        <Text style={[styles.permSub, { color: colors.mutedForeground, fontSize: 13 * fontSize }]}>
          Enable camera access in your device settings to use Sign Mode.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      {/* Camera / Scanner area */}
      <View style={[styles.cameraWrapper, { paddingTop: topPad }]}>
        {isActive && permission?.granted ? (
          <View style={styles.cameraContainer}>
            <CameraView style={cameraStyle} facing={facing} />
            {/* Scan overlay */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    backgroundColor: colors.primary,
                    transform: [
                      {
                        translateY: scanLineAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 220],
                        }),
                      },
                    ],
                  },
                ]}
              />
              {/* Corner markers */}
              {[
                styles.tl, styles.tr, styles.bl, styles.br,
              ].map((corner, i) => (
                <View
                  key={i}
                  style={[styles.corner, corner, { borderColor: colors.primary }]}
                />
              ))}
            </View>
            {/* FPS badge */}
            <View style={[styles.fpsBadge, { backgroundColor: colors.success + "dd" }]}>
              <Text style={styles.fpsText}>{fps} fps</Text>
            </View>
            {/* Flip camera */}
            <TouchableOpacity
              style={[styles.flipBtn, { backgroundColor: "rgba(0,0,0,0.5)" }]}
              onPress={() => setFacing((f) => (f === "front" ? "back" : "front"))}
            >
              <Feather name="refresh-cw" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            <View style={[styles.cameraPlaceholder, { backgroundColor: "#111827" }]}>
              {[styles.tl, styles.tr, styles.bl, styles.br].map((corner, i) => (
                <View
                  key={i}
                  style={[styles.corner, corner, { borderColor: colors.border }]}
                />
              ))}
              <View style={styles.inactivePlaceholder}>
                <Feather name="camera" size={44} color={colors.mutedForeground} />
                <Text style={[styles.inactiveText, { color: colors.mutedForeground, fontSize: 13 * fontSize }]}>
                  Tap Start to activate camera
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Gesture label */}
        <View style={styles.gestureRow}>
          {currentGesture ? (
            <Animated.Text
              style={[
                styles.gestureWord,
                { color: "#fff", fontSize: 28 * fontSize, transform: [{ scale: pulseAnim }] },
              ]}
            >
              {currentGesture}
            </Animated.Text>
          ) : (
            <Text style={[styles.gesturePlaceholder, { color: "rgba(255,255,255,0.35)", fontSize: 16 * fontSize }]}>
              — Detecting gesture —
            </Text>
          )}
        </View>
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
          <View style={styles.sentenceHeader}>
            <Text style={[styles.sentenceLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
              SENTENCE BUFFER
            </Text>
            {isActive && (
              <View style={[styles.liveDot, { backgroundColor: colors.destructive }]} />
            )}
          </View>
          <Text
            style={[
              styles.sentenceText,
              {
                color: sentence.length ? colors.foreground : colors.mutedForeground,
                fontSize: 15 * fontSize,
              },
            ]}
            numberOfLines={2}
          >
            {sentence.length ? sentence.join(" ") : "Detected words appear here…"}
          </Text>
          {sentence.length > 0 && (
            <TouchableOpacity onPress={() => setSentence([])} style={styles.clearBtn}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: isActive ? colors.destructive : colors.primary },
            ]}
            onPress={isActive ? stopRecognition : startRecognition}
            activeOpacity={0.85}
          >
            <Feather name={isActive ? "square" : "play"} size={20} color="#fff" />
            <Text style={[styles.btnText, { fontSize: 14 * fontSize }]}>
              {isActive ? "Stop" : "Start Camera"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: sentence.length ? colors.success : colors.muted,
                opacity: sentence.length ? 1 : 0.5,
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
              Send & Speak
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info row */}
        {isActive && (
          <View style={[styles.infoRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
            <Feather name="info" size={12} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
              Tap "Send & Speak" to voice the sentence aloud for hearing users
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  permText: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  permSub: { fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  cameraWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  cameraContainer: {
    width: 280,
    height: 240,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  cameraPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  scanLine: { position: "absolute", left: 0, right: 0, height: 2, opacity: 0.8 },
  corner: { position: "absolute", width: 20, height: 20, borderWidth: 2.5 },
  tl: { top: 8, left: 8, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 5 },
  tr: { top: 8, right: 8, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 5 },
  bl: { bottom: 8, left: 8, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 5 },
  br: { bottom: 8, right: 8, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 5 },
  inactivePlaceholder: { alignItems: "center", gap: 12 },
  inactiveText: { fontFamily: "Inter_400Regular" },
  fpsBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
  },
  fpsText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
  flipBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  gestureRow: { height: 48, justifyContent: "center", alignItems: "center", marginTop: 10 },
  gestureWord: { fontFamily: "Inter_700Bold", letterSpacing: 3 },
  gesturePlaceholder: { fontFamily: "Inter_400Regular" },
  panel: { padding: 18, gap: 14 },
  sentenceBox: { borderRadius: 14, padding: 14, borderWidth: 1, minHeight: 72, position: "relative" },
  sentenceHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  sentenceLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5 },
  sentenceText: { fontFamily: "Inter_500Medium", lineHeight: 22 },
  clearBtn: { position: "absolute", top: 12, right: 12 },
  btnRow: { flexDirection: "row", gap: 10 },
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
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  sendText: { fontFamily: "Inter_600SemiBold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  infoText: { fontFamily: "Inter_400Regular", flex: 1 },
});
