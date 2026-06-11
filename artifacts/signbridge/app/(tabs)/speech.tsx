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
import { SignAvatar } from "@/components/SignAvatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const SIGN_WORDS = ["HELLO", "HELP", "THANK", "YES", "NO", "PLEASE", "SORRY", "GOOD", "BAD", "LOVE", "HOW", "ARE", "YOU"];
const QUICK_PHRASES = [
  "Hello, how are you today?",
  "I need help please.",
  "Thank you very much.",
  "Nice to meet you.",
  "Can you help me?",
  "I am doing well.",
];

export default function SpeechScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const {
    transcript, interimTranscript, isListening, isSupported,
    error: speechError, start: startRec, stop: stopRec, reset: resetRec,
  } = useSpeechRecognition();

  const [manualText, setManualText] = useState("");
  const [mode, setMode] = useState<"mic" | "type">(Platform.OS === "web" ? "mic" : "type");
  const [avatarWord, setAvatarWord] = useState("");
  const [avatarQueue, setAvatarQueue] = useState<string[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([...Array(5)].map(() => new Animated.Value(0.2))).current;
  const waveLoop = useRef<Animated.CompositeAnimation | null>(null);
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const activeText = mode === "mic" ? transcript : manualText;

  /* Wave animation synced to isListening */
  useEffect(() => {
    if (isListening) {
      const waves = waveAnims.map((anim, i) =>
        Animated.loop(Animated.sequence([
          Animated.delay(i * 90),
          Animated.timing(anim, { toValue: 1, duration: 350 + i * 20, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.15, duration: 350 + i * 20, useNativeDriver: true }),
        ]))
      );
      waveLoop.current = Animated.parallel(waves);
      waveLoop.current.start();
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])).start();
    } else {
      waveLoop.current?.stop();
      waveAnims.forEach((a) => a.setValue(0.2));
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  /* Avatar queue */
  useEffect(() => {
    if (!isSigning || !avatarQueue.length) return;
    if (avatarQueue.length === 1) {
      const t = setTimeout(() => { setIsSigning(false); setAvatarWord(""); setAvatarQueue([]); }, 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const [, ...rest] = avatarQueue;
      setAvatarQueue(rest);
      setAvatarWord(rest[0]);
    }, 1100);
    return () => clearTimeout(t);
  }, [isSigning, avatarQueue]);

  const playSigns = useCallback((text: string) => {
    const words = text.toUpperCase().replace(/[^A-Z\s]/g, "").split(/\s+/).filter(Boolean);
    const matched = words.filter((w) => SIGN_WORDS.includes(w));
    const queue = matched.length ? matched : words.slice(0, 5);
    if (!queue.length) return;
    setAvatarQueue(queue);
    setAvatarWord(queue[0]);
    setIsSigning(true);
  }, []);

  const send = useCallback(() => {
    const text = activeText.trim();
    if (!text) return;
    addMessage({ sender: "hearing", text, type: "speech" });
    playSigns(text);
    setIsSpeaking(true);
    Speech.speak(text, { rate: settings.speechRate, language: "en-US", onDone: () => setIsSpeaking(false), onStopped: () => setIsSpeaking(false) });
    if (mode === "mic") resetRec(); else setManualText("");
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [activeText, addMessage, playSigns, settings, mode, resetRec]);

  const toggleMic = useCallback(() => {
    if (isListening) stopRec(); else startRec();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [isListening, startRec, stopRec]);

  const displayed = transcript + (interimTranscript ? " " + interimTranscript : "");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 90 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar card */}
      <LinearGradient
        colors={[colors.card, colors.background]}
        style={[styles.avatarCard, { borderColor: colors.border }]}
      >
        <Text style={[styles.avatarLabel, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
          SIGN LANGUAGE AVATAR — OUTPUT
        </Text>
        <SignAvatar word={avatarWord} size={110} />
        <View style={styles.avatarBadges}>
          {isSigning ? (
            <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary, fontSize: 12 * fs }]}>Signing…</Text>
            </View>
          ) : isSpeaking ? (
            <View style={[styles.badge, { backgroundColor: colors.accent + "22" }]}>
              <View style={[styles.badgeDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.badgeText, { color: colors.accent, fontSize: 12 * fs }]}>Speaking…</Text>
            </View>
          ) : (
            <Text style={[styles.avatarIdle, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
              Avatar signs back to deaf user
            </Text>
          )}
        </View>
      </LinearGradient>

      {/* Mode toggle */}
      <View style={[styles.modeToggle, { backgroundColor: colors.muted }]}>
        {(["mic", "type"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modeTab, { backgroundColor: mode === m ? colors.primary : "transparent" }]}
            onPress={() => setMode(m)}
          >
            <Feather name={m === "mic" ? "mic" : "edit-2"} size={14} color={mode === m ? "#fff" : colors.mutedForeground} />
            <Text style={[styles.modeTabText, { color: mode === m ? "#fff" : colors.mutedForeground, fontSize: 13 * fs }]}>
              {m === "mic" ? "Microphone" : "Type"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "mic" ? (
        <>
          {/* Warnings */}
          {!isSupported && Platform.OS === "web" && (
            <View style={[styles.warn, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "55" }]}>
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.warnText, { color: colors.warning, fontSize: 12 * fs }]}>
                Use Chrome or Edge for microphone support. Type mode works in all browsers.
              </Text>
            </View>
          )}
          {Platform.OS !== "web" && (
            <View style={[styles.warn, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "55" }]}>
              <Feather name="smartphone" size={14} color={colors.warning} />
              <Text style={[styles.warnText, { color: colors.warning, fontSize: 12 * fs }]}>
                Live recognition works in the browser. On mobile, use Type mode or Expo Go.
              </Text>
            </View>
          )}
          {speechError && (
            <View style={[styles.warn, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "55" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.warnText, { color: colors.destructive, fontSize: 12 * fs }]}>{speechError}</Text>
            </View>
          )}

          {/* Mic button */}
          <View style={styles.micArea}>
            {/* Wave bars */}
            <View style={styles.waveRow}>
              {waveAnims.map((a, i) => (
                <Animated.View
                  key={i}
                  style={[styles.waveBar, {
                    backgroundColor: isListening ? colors.primary : colors.border,
                    height: 12 + i * 8,
                    transform: [{ scaleY: a }],
                  }]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={toggleMic} activeOpacity={0.85} disabled={!isSupported && Platform.OS === "web"}>
              <Animated.View style={[
                styles.micBtn,
                { backgroundColor: isListening ? colors.destructive : colors.primary, transform: [{ scale: pulseAnim }] },
                (!isSupported && Platform.OS === "web") && { opacity: 0.4 },
              ]}>
                <Feather name={isListening ? "mic-off" : "mic"} size={28} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
              {isListening ? "Listening… tap to stop" : isSupported ? "Tap to start listening" : "Unavailable"}
            </Text>
          </View>

          {/* Transcript */}
          <View style={[styles.transcriptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.transcriptLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>LIVE TRANSCRIPT</Text>
            {displayed ? (
              <Text style={[styles.transcriptText, { color: colors.foreground, fontSize: 15 * fs }]}>
                {transcript}
                {interimTranscript ? <Text style={{ color: colors.mutedForeground }}> {interimTranscript}</Text> : null}
              </Text>
            ) : (
              <Text style={[styles.transcriptPlaceholder, { color: colors.mutedForeground, fontSize: 14 * fs }]}>
                Your speech will appear here…
              </Text>
            )}
          </View>
        </>
      ) : (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontSize: 15 * fs }]}
            value={manualText}
            onChangeText={setManualText}
            placeholder="Type a message to convert to speech & signs…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={300}
          />
          <View style={styles.charRow}>
            <Text style={[styles.charHint, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              Quick phrases
            </Text>
            <Text style={[styles.charCount, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              {manualText.length}/300
            </Text>
          </View>
          <View style={styles.phrasesGrid}>
            {QUICK_PHRASES.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setManualText(p)}
                style={[styles.phraseChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
              >
                <Text style={[styles.phraseText, { color: colors.foreground, fontSize: 12 * fs }]} numberOfLines={1}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Send */}
      <TouchableOpacity
        style={[styles.sendBtn, { backgroundColor: activeText.trim() ? colors.success : colors.muted, opacity: activeText.trim() ? 1 : 0.5 }]}
        onPress={send}
        disabled={!activeText.trim()}
        activeOpacity={0.85}
      >
        <Feather name="send" size={18} color={activeText.trim() ? "#fff" : colors.mutedForeground} />
        <Text style={[styles.sendLabel, { color: activeText.trim() ? "#fff" : colors.mutedForeground, fontSize: 15 * fs }]}>
          Send — Speak & Sign
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, gap: 16 },
  avatarCard: { borderRadius: 20, padding: 20, borderWidth: 1, alignItems: "center", gap: 10 },
  avatarLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8, alignSelf: "flex-start" },
  avatarBadges: { flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontFamily: "Inter_600SemiBold" },
  avatarIdle: { fontFamily: "Inter_400Regular" },
  modeToggle: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  modeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10 },
  modeTabText: { fontFamily: "Inter_600SemiBold" },
  warn: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  warnText: { fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  micArea: { alignItems: "center", gap: 14, paddingVertical: 6 },
  waveRow: { flexDirection: "row", gap: 5, alignItems: "center", height: 50 },
  waveBar: { width: 5, borderRadius: 3 },
  micBtn: { width: 78, height: 78, borderRadius: 39, justifyContent: "center", alignItems: "center" },
  micHint: { fontFamily: "Inter_400Regular" },
  transcriptCard: { borderRadius: 14, padding: 14, borderWidth: 1, minHeight: 90 },
  transcriptLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8, marginBottom: 8 },
  transcriptText: { fontFamily: "Inter_500Medium", lineHeight: 24 },
  transcriptPlaceholder: { fontFamily: "Inter_400Regular" },
  input: { borderRadius: 16, borderWidth: 1, padding: 16, minHeight: 120, fontFamily: "Inter_400Regular", lineHeight: 22, textAlignVertical: "top" },
  charRow: { flexDirection: "row", justifyContent: "space-between" },
  charHint: { fontFamily: "Inter_500Medium" },
  charCount: { fontFamily: "Inter_400Regular" },
  phrasesGrid: { gap: 8 },
  phraseChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  phraseText: { fontFamily: "Inter_400Regular" },
  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  sendLabel: { fontFamily: "Inter_600SemiBold" },
});
