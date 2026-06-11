import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { HandAvatarPro } from "@/components/HandAvatarPro";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSignQueue } from "@/hooks/useSignQueue";
import { textToGestureSequence, gestureToLabel } from "@/utils/textToSign";

const QUICK_PHRASES = [
  "Hello, how are you?",
  "I need help please.",
  "Thank you very much.",
  "Nice to meet you.",
  "Can you help me?",
  "I love you.",
  "Good morning.",
  "Please call me.",
];

export default function SpeechScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const {
    transcript, interimTranscript, isListening, isSupported,
    error: speechError, start: startRec, stop: stopRec, reset: resetRec,
  } = useSpeechRecognition();

  const signQueue = useSignQueue(1000);

  const [manualText, setManualText] = useState("");
  const [mode, setMode] = useState<"mic" | "type">(Platform.OS === "web" ? "mic" : "type");
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([...Array(7)].map(() => new Animated.Value(0.15))).current;
  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeText = mode === "mic" ? transcript : manualText;
  const liveDisplay = transcript + (interimTranscript ? " " + interimTranscript : "");

  /* ── Wave bars while listening ── */
  useEffect(() => {
    if (isListening) {
      const waves = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 70),
            Animated.timing(anim, { toValue: 1, duration: 260 + i * 30, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.15, duration: 260 + i * 30, useNativeDriver: true }),
          ])
        )
      );
      waveLoopRef.current = Animated.parallel(waves);
      waveLoopRef.current.start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      waveLoopRef.current?.stop();
      waveAnims.forEach((a) => Animated.timing(a, { toValue: 0.15, duration: 200, useNativeDriver: true }).start());
      pulseAnim.stopAnimation();
      Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
    }
  }, [isListening]);

  /* ── Auto-sign as words arrive from mic ── */
  const prevTranscriptRef = useRef("");
  useEffect(() => {
    if (!transcript || transcript === prevTranscriptRef.current) return;
    prevTranscriptRef.current = transcript;
    const gestures = textToGestureSequence(transcript);
    if (gestures.length) signQueue.play(gestures);
  }, [transcript]);

  const send = useCallback(() => {
    const text = activeText.trim();
    if (!text) return;

    // Log to conversation
    addMessage({ sender: "hearing", text, type: "speech" });

    // Play gesture sequence for avatar
    const gestures = textToGestureSequence(text);
    signQueue.play(gestures);

    // TTS
    setIsSpeakingTTS(true);
    Speech.speak(text, {
      rate: settings.speechRate,
      language: "en-US",
      onDone: () => setIsSpeakingTTS(false),
      onStopped: () => setIsSpeakingTTS(false),
      onError: () => setIsSpeakingTTS(false),
    });

    if (mode === "mic") resetRec(); else setManualText("");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeText, addMessage, signQueue, settings, mode, resetRec]);

  const toggleMic = useCallback(() => {
    if (isListening) stopRec(); else startRec();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isListening, startRec, stopRec]);

  const currentGestureLabel = signQueue.currentGesture
    ? gestureToLabel(signQueue.currentGesture)
    : "";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 14, paddingBottom: insets.bottom + 90 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Avatar card ── */}
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.avatarCard, { borderColor: colors.border }]}
      >
        <View style={styles.avatarHeader}>
          <Text style={[styles.avatarLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>
            SIGN LANGUAGE AVATAR — REAL-TIME OUTPUT
          </Text>
          {signQueue.isSigning && (
            <View style={[styles.signingBadge, { backgroundColor: colors.primary + "22" }]}>
              <View style={[styles.signingDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.signingText, { color: colors.primary, fontSize: 10 * fs }]}>
                {signQueue.currentIndex + 1}/{signQueue.total}
              </Text>
            </View>
          )}
        </View>

        {/* Hand avatar with smooth lerp animation */}
        <HandAvatarPro gesture={signQueue.currentGesture} size={140} primaryColor={colors.primary} />

        {/* Gesture name */}
        <View style={styles.gestureNameRow}>
          {signQueue.isSigning ? (
            <>
              <View style={[styles.gestureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.gestureName, { color: colors.primary, fontSize: 14 * fs }]}>
                {currentGestureLabel}
              </Text>
            </>
          ) : isSpeakingTTS ? (
            <>
              <View style={[styles.gestureDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.gestureName, { color: colors.accent, fontSize: 13 * fs }]}>Speaking…</Text>
            </>
          ) : (
            <Text style={[styles.gestureIdle, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
              Send a message to see the avatar sign it
            </Text>
          )}
        </View>

        {/* Progress bar when signing */}
        {signQueue.isSigning && signQueue.total > 1 && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: `${((signQueue.currentIndex + 1) / signQueue.total) * 100}%`,
                },
              ]}
            />
          </View>
        )}
      </LinearGradient>

      {/* ── Mode toggle ── */}
      <View style={[styles.modeToggle, { backgroundColor: colors.muted }]}>
        {(["mic", "type"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, { backgroundColor: mode === m ? colors.primary : "transparent" }]}
            onPress={() => { setMode(m); if (m === "mic" && isListening) stopRec(); }}
          >
            <Feather name={m === "mic" ? "mic" : "edit-2"} size={14} color={mode === m ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.modeTabText, { color: mode === m ? "#fff" : colors.mutedForeground, fontSize: 13 * fs }]}>
              {m === "mic" ? "Microphone" : "Type"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Mic mode ── */}
      {mode === "mic" ? (
        <>
          {!isSupported && Platform.OS === "web" && (
            <View style={[styles.alert, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "44" }]}>
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.alertText, { color: colors.warning, fontSize: 12 * fs }]}>
                Real-time speech recognition requires Chrome or Edge. Switch to Type mode for other browsers.
              </Text>
            </View>
          )}
          {speechError ? (
            <View style={[styles.alert, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "44" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.alertText, { color: colors.destructive, fontSize: 12 * fs }]}>{speechError}</Text>
            </View>
          ) : null}

          {/* Mic button + waveform */}
          <View style={styles.micSection}>
            <View style={styles.waveRow}>
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: 8 + i * 7,
                      backgroundColor: isListening ? colors.primary : colors.border,
                      transform: [{ scaleY: anim }],
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={toggleMic}
              disabled={!isSupported && Platform.OS === "web"}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.micBtn,
                  {
                    backgroundColor: isListening ? colors.destructive : colors.primary,
                    transform: [{ scale: pulseAnim }],
                    opacity: (!isSupported && Platform.OS === "web") ? 0.4 : 1,
                  },
                ]}
              >
                <Feather name={isListening ? "mic-off" : "mic"} size={28} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
              {isListening ? "Listening… tap to stop" : (isSupported ? "Tap to speak" : "Unavailable")}
            </Text>
          </View>

          {/* Live transcript */}
          <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.transcriptHeader}>
              <Text style={[styles.transcriptLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>
                LIVE TRANSCRIPT
              </Text>
              {isListening && (
                <View style={[styles.liveIndicator, { backgroundColor: colors.destructive }]} />
              )}
            </View>
            {liveDisplay ? (
              <Text style={[styles.transcriptText, { color: colors.foreground, fontSize: 15 * fs }]}>
                <Text>{transcript}</Text>
                {interimTranscript ? (
                  <Text style={{ color: colors.mutedForeground }}> {interimTranscript}</Text>
                ) : null}
              </Text>
            ) : (
              <Text style={[styles.transcriptPlaceholder, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
                Your speech appears here in real-time…{"\n"}Avatar signs as you speak.
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          {/* Type mode */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                fontSize: 15 * fs,
              },
            ]}
            value={manualText}
            onChangeText={setManualText}
            placeholder="Type a message — avatar will sign each word in real-time…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={300}
            returnKeyType="default"
          />
          <View style={styles.typeFooter}>
            <Text style={[styles.charCount, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              {manualText.length}/300
            </Text>
          </View>

          {/* Quick phrases */}
          <Text style={[styles.quickLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>
            QUICK PHRASES
          </Text>
          <View style={styles.phrasesGrid}>
            {QUICK_PHRASES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setManualText(p)}
                style={[styles.phraseChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                activeOpacity={0.75}
              >
                <Text style={[styles.phraseText, { color: colors.foreground, fontSize: 12 * fs }]} numberOfLines={1}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* ── Send ── */}
      <TouchableOpacity
        style={[
          styles.sendBtn,
          {
            backgroundColor: activeText.trim() ? colors.success : colors.muted,
            opacity: activeText.trim() ? 1 : 0.45,
          },
        ]}
        onPress={send}
        disabled={!activeText.trim()}
        activeOpacity={0.85}
      >
        <Feather name="send" size={18} color={activeText.trim() ? "#fff" : colors.mutedForeground} />
        <Text style={[styles.sendLabel, { color: activeText.trim() ? "#fff" : colors.mutedForeground, fontSize: 15 * fs }]}>
          Speak & Sign
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, gap: 14 },
  avatarCard: { borderRadius: 22, padding: 18, borderWidth: 1, alignItems: "center", gap: 10 },
  avatarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" },
  avatarLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  signingBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  signingDot: { width: 6, height: 6, borderRadius: 3 },
  signingText: { fontFamily: "Inter_600SemiBold" },
  gestureNameRow: { flexDirection: "row", alignItems: "center", gap: 7, minHeight: 24 },
  gestureDot: { width: 8, height: 8, borderRadius: 4 },
  gestureName: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  gestureIdle: { fontFamily: "Inter_400Regular" },
  progressBar: { height: 3, borderRadius: 2, width: "90%", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  modeToggle: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  modeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 10 },
  modeTabText: { fontFamily: "Inter_600SemiBold" },
  alert: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  alertText: { fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  micSection: { alignItems: "center", gap: 16, paddingVertical: 4 },
  waveRow: { flexDirection: "row", gap: 5, alignItems: "center", height: 52 },
  waveBar: { width: 5, borderRadius: 3 },
  micBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  micHint: { fontFamily: "Inter_400Regular" },
  transcriptCard: { borderRadius: 16, padding: 14, borderWidth: 1, minHeight: 96 },
  transcriptHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  transcriptLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4 },
  transcriptText: { fontFamily: "Inter_500Medium", lineHeight: 24 },
  transcriptPlaceholder: { fontFamily: "Inter_400Regular", lineHeight: 20 },
  input: { borderRadius: 16, borderWidth: 1, padding: 16, minHeight: 110, fontFamily: "Inter_400Regular", lineHeight: 22, textAlignVertical: "top" },
  typeFooter: { alignItems: "flex-end" },
  charCount: { fontFamily: "Inter_400Regular" },
  quickLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  phrasesGrid: { gap: 8 },
  phraseChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  phraseText: { fontFamily: "Inter_400Regular" },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  sendLabel: { fontFamily: "Inter_600SemiBold" },
});
