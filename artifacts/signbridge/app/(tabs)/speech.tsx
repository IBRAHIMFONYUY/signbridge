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
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SignAvatar } from "@/components/SignAvatar";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const SIGN_WORDS = ["HELLO", "HELP", "THANK", "YES", "NO", "PLEASE", "SORRY", "GOOD", "BAD", "LOVE", "HOW", "ARE", "YOU"];

const SAMPLE_PHRASES = [
  "Hello, how are you today?",
  "I need some help please.",
  "Thank you very much.",
  "Can you help me find this?",
  "Nice to meet you.",
  "I am doing well, thank you.",
];

export default function SpeechScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error: speechError,
    start: startRecognition,
    stop: stopRecognition,
    reset: resetRecognition,
  } = useSpeechRecognition();

  const [manualText, setManualText] = useState("");
  const [mode, setMode] = useState<"mic" | "type">(
    Platform.OS === "web" ? "mic" : "type"
  );
  const [avatarWord, setAvatarWord] = useState("");
  const [avatarQueue, setAvatarQueue] = useState<string[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.2))).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const activeText = mode === "mic" ? transcript : manualText;

  /* Wave animation */
  useEffect(() => {
    if (isListening) {
      const animations = waveAnims.map((anim, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 90),
            Animated.timing(anim, { toValue: 1, duration: 380, useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0.2, duration: 380, useNativeDriver: true }),
          ])
        )
      );
      const all = Animated.parallel(animations);
      all.start();
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.14, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
      return () => {
        all.stop();
        pulseLoop.current?.stop();
        waveAnims.forEach((a) => a.setValue(0.2));
        pulseAnim.setValue(1);
      };
    }
  }, [isListening]);

  /* Avatar queue processing */
  useEffect(() => {
    if (!isSigning || avatarQueue.length === 0) return;
    if (avatarQueue.length === 1) {
      const t = setTimeout(() => {
        setIsSigning(false);
        setAvatarWord("");
        setAvatarQueue([]);
      }, 1400);
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
    const rawWords = text
      .toUpperCase()
      .replace(/[^A-Z\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
    const matching = rawWords.filter((w) => SIGN_WORDS.includes(w));
    const queue = matching.length > 0 ? matching : rawWords.slice(0, 5);
    if (queue.length === 0) return;
    setAvatarQueue(queue);
    setAvatarWord(queue[0]);
    setIsSigning(true);
  }, []);

  const sendMessage = useCallback(() => {
    const text = activeText.trim();
    if (!text) return;
    addMessage({ sender: "hearing", text, type: "speech" });
    playSigns(text);
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: settings.speechRate,
      language: "en-US",
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
    if (mode === "mic") resetRecognition();
    else setManualText("");
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeText, addMessage, playSigns, settings, mode, resetRecognition]);

  const handleMicToggle = useCallback(() => {
    if (isListening) {
      stopRecognition();
    } else {
      startRecognition();
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [isListening, startRecognition, stopRecognition]);

  const useSample = useCallback((phrase: string) => {
    setManualText(phrase);
    setMode("type");
  }, []);

  const displayedTranscript = transcript + (interimTranscript ? " " + interimTranscript : "");

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 90 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar area */}
      <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.avatarLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
          SIGN LANGUAGE AVATAR OUTPUT
        </Text>
        <SignAvatar word={avatarWord} size={100} />
        <View style={styles.avatarStatus}>
          {isSigning && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary + "22" }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.statusText, { color: colors.primary, fontSize: 12 * fontSize }]}>Signing…</Text>
            </View>
          )}
          {isSpeaking && (
            <View style={[styles.statusBadge, { backgroundColor: colors.accent + "22" }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.statusText, { color: colors.accent, fontSize: 12 * fontSize }]}>Speaking…</Text>
            </View>
          )}
          {!isSigning && !isSpeaking && (
            <Text style={[styles.avatarIdle, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
              Avatar will sign translated speech
            </Text>
          )}
        </View>
      </View>

      {/* Mode toggle */}
      <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        {(["mic", "type"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.modeBtn,
              { backgroundColor: mode === m ? colors.primary : "transparent" },
            ]}
            onPress={() => setMode(m)}
          >
            <Feather
              name={m === "mic" ? "mic" : "edit-2"}
              size={14}
              color={mode === m ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.modeBtnText,
                { color: mode === m ? "#fff" : colors.mutedForeground, fontSize: 13 * fontSize },
              ]}
            >
              {m === "mic" ? "Microphone" : "Type"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "mic" ? (
        <>
          {!isSupported && Platform.OS === "web" && (
            <View style={[styles.warningBox, { backgroundColor: colors.warning + "22", borderColor: colors.warning }]}>
              <Feather name="alert-triangle" size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning, fontSize: 12 * fontSize }]}>
                Speech recognition is not supported in this browser. Use Chrome or Edge, or switch to Type mode.
              </Text>
            </View>
          )}
          {Platform.OS !== "web" && (
            <View style={[styles.warningBox, { backgroundColor: colors.warning + "22", borderColor: colors.warning }]}>
              <Feather name="smartphone" size={14} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning, fontSize: 12 * fontSize }]}>
                Live microphone recognition requires a browser. Switch to Type mode on this device.
              </Text>
            </View>
          )}
          {speechError && (
            <View style={[styles.warningBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.warningText, { color: colors.destructive, fontSize: 12 * fontSize }]}>{speechError}</Text>
            </View>
          )}

          {/* Mic button + waves */}
          <View style={styles.micSection}>
            <View style={styles.waveRow}>
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.wave,
                    {
                      backgroundColor: colors.primary,
                      height: 16 + i * 7,
                      transform: [{ scaleY: anim }],
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleMicToggle} activeOpacity={0.85} disabled={!isSupported && Platform.OS === "web"}>
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
                <Feather name={isListening ? "mic-off" : "mic"} size={30} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
              {isListening
                ? "Listening… tap to stop"
                : isSupported
                ? "Tap microphone to start listening"
                : "Microphone unavailable"}
            </Text>
          </View>

          {/* Transcript display */}
          <View style={[styles.transcriptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.transcriptLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
              TRANSCRIPT
            </Text>
            {displayedTranscript ? (
              <Text style={[styles.transcriptFinal, { color: colors.foreground, fontSize: 16 * fontSize }]}>
                {transcript}
                {interimTranscript ? (
                  <Text style={{ color: colors.mutedForeground }}> {interimTranscript}</Text>
                ) : null}
              </Text>
            ) : (
              <Text style={[styles.transcriptPlaceholder, { color: colors.mutedForeground, fontSize: 15 * fontSize }]}>
                Your speech will appear here as you talk…
              </Text>
            )}
          </View>
        </>
      ) : (
        <View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.foreground,
                fontSize: 15 * fontSize,
              },
            ]}
            value={manualText}
            onChangeText={setManualText}
            placeholder="Type a message to convert to signs and speak aloud…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={300}
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            {manualText.length}/300
          </Text>
        </View>
      )}

      {/* Quick phrases */}
      {mode === "type" && (
        <>
          <Text style={[styles.samplesLabel, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
            Quick phrases
          </Text>
          <View style={styles.samplesGrid}>
            {SAMPLE_PHRASES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.sampleChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => useSample(p)}
              >
                <Text style={[styles.sampleText, { color: colors.foreground, fontSize: 12 * fontSize }]} numberOfLines={1}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Send button */}
      <TouchableOpacity
        style={[
          styles.sendBtn,
          {
            backgroundColor: activeText.trim() ? colors.success : colors.muted,
            opacity: activeText.trim() ? 1 : 0.5,
          },
        ]}
        onPress={sendMessage}
        disabled={!activeText.trim()}
        activeOpacity={0.85}
      >
        <Feather name="send" size={18} color={activeText.trim() ? "#fff" : colors.mutedForeground} />
        <Text
          style={[
            styles.sendText,
            { color: activeText.trim() ? "#fff" : colors.mutedForeground, fontSize: 15 * fontSize },
          ]}
        >
          Send — Speak & Sign
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 16 },
  avatarCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  avatarLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, alignSelf: "flex-start" },
  avatarStatus: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: "Inter_600SemiBold" },
  avatarIdle: { fontFamily: "Inter_400Regular" },
  modeToggle: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modeBtnText: { fontFamily: "Inter_600SemiBold" },
  warningBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  warningText: { fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  micSection: { alignItems: "center", gap: 14 },
  waveRow: { flexDirection: "row", gap: 5, alignItems: "center", height: 44 },
  wave: { width: 5, borderRadius: 3 },
  micBtn: { width: 76, height: 76, borderRadius: 38, justifyContent: "center", alignItems: "center" },
  micHint: { fontFamily: "Inter_400Regular" },
  transcriptBox: { borderRadius: 14, padding: 14, borderWidth: 1, minHeight: 88 },
  transcriptLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 8 },
  transcriptFinal: { fontFamily: "Inter_500Medium", lineHeight: 24 },
  transcriptPlaceholder: { fontFamily: "Inter_400Regular" },
  samplesLabel: { fontFamily: "Inter_500Medium" },
  samplesGrid: { gap: 8 },
  sampleChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  sampleText: { fontFamily: "Inter_400Regular" },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 110,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlignVertical: "top",
  },
  charCount: { fontFamily: "Inter_400Regular", textAlign: "right", marginTop: 4 },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  sendText: { fontFamily: "Inter_600SemiBold" },
});
