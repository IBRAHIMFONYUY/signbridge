import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
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
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SignAvatar } from "@/components/SignAvatar";

const SAMPLE_PHRASES = [
  "Hello, how are you today?",
  "I need some assistance please.",
  "Thank you very much.",
  "Can you help me?",
  "I am doing well.",
  "Nice to meet you.",
];

const SIGN_WORDS = ["HELLO", "HELP", "THANK", "YES", "NO", "PLEASE", "SORRY", "GOOD", "BAD", "LOVE"];

export default function SpeechScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMessage, settings } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [avatarWord, setAvatarWord] = useState("");
  const [avatarQueue, setAvatarQueue] = useState<string[]>([]);
  const [isSigning, setIsSigning] = useState(false);
  const [mode, setMode] = useState<"mic" | "type">("mic");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.2))).current;
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const animateWaves = useCallback(() => {
    const animations = waveAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.2, duration: 350, useNativeDriver: true }),
        ])
      )
    );
    Animated.parallel(animations).start();
  }, [waveAnims]);

  const stopWaves = useCallback(() => {
    waveAnims.forEach((a) => {
      a.stopAnimation();
      a.setValue(0.2);
    });
  }, [waveAnims]);

  const startListening = useCallback(() => {
    setIsListening(true);
    setTranscript("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    animateWaves();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();

    const phrases = [...SAMPLE_PHRASES].sort(() => Math.random() - 0.5);
    let built = "";
    let wordIdx = 0;
    const words = phrases[0].split(" ");

    const typeWords = () => {
      if (wordIdx < words.length) {
        built += (wordIdx > 0 ? " " : "") + words[wordIdx++];
        setTranscript(built);
        listenTimer.current = setTimeout(typeWords, 200 + Math.random() * 150);
      }
    };
    listenTimer.current = setTimeout(typeWords, 600);
  }, [animateWaves, pulseAnim]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    stopWaves();
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    if (listenTimer.current) clearTimeout(listenTimer.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [stopWaves, pulseAnim]);

  const playSigns = useCallback((text: string) => {
    const words = text
      .toUpperCase()
      .replace(/[^A-Z\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);

    if (words.length === 0) return;

    const matching = words.filter((w) => SIGN_WORDS.includes(w));
    const queue = matching.length > 0 ? matching : words.slice(0, 4);
    setAvatarQueue(queue);
    setIsSigning(true);
    setAvatarWord(queue[0]);
  }, []);

  useEffect(() => {
    if (!isSigning || avatarQueue.length === 0) return;
    if (avatarQueue.length === 1) {
      const t = setTimeout(() => {
        setIsSigning(false);
        setAvatarWord("");
        setAvatarQueue([]);
      }, 1500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      const [, ...rest] = avatarQueue;
      setAvatarQueue(rest);
      setAvatarWord(rest[0]);
    }, 1200);
    return () => clearTimeout(t);
  }, [isSigning, avatarQueue]);

  const sendMessage = useCallback(() => {
    const text = mode === "mic" ? transcript : manualText;
    if (!text.trim()) return;
    addMessage({ sender: "hearing", text: text.trim(), type: "speech" });
    playSigns(text);
    if (mode === "mic") setTranscript("");
    else setManualText("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [mode, transcript, manualText, addMessage, playSigns]);

  const speakSample = useCallback((phrase: string) => {
    Speech.speak(phrase, { rate: settings.speechRate });
    setTranscript(phrase);
  }, [settings.speechRate]);

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: insets.bottom + 90 },
      ]}
      bottomOffset={90}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar area */}
      <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.avatarLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
          SIGN LANGUAGE AVATAR
        </Text>
        <View style={styles.avatarCenter}>
          <SignAvatar word={avatarWord} size={100} />
        </View>
        {isSigning && (
          <View style={[styles.signingBadge, { backgroundColor: colors.accent + "22" }]}>
            <View style={[styles.signingDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.signingText, { color: colors.accent }]}>Signing…</Text>
          </View>
        )}
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
              size={15}
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
          {/* Mic button */}
          <View style={styles.micArea}>
            <View style={styles.waveRow}>
              {waveAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.wave,
                    {
                      backgroundColor: colors.primary,
                      height: 20 + i * 8,
                      transform: [{ scaleY: anim }],
                    },
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              onPress={isListening ? stopListening : startListening}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.micBtn,
                  {
                    backgroundColor: isListening ? colors.destructive : colors.primary,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Feather name={isListening ? "mic-off" : "mic"} size={32} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
            <Text style={[styles.micHint, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
              {isListening ? "Listening… tap to stop" : "Tap to start listening"}
            </Text>
          </View>

          {/* Transcript */}
          <View style={[styles.transcriptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.transcriptLabel, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
              TRANSCRIPT
            </Text>
            <Text
              style={[
                styles.transcriptText,
                {
                  color: transcript ? colors.foreground : colors.mutedForeground,
                  fontSize: 16 * fontSize,
                },
              ]}
            >
              {transcript || "Speech will appear here…"}
            </Text>
          </View>

          {/* Quick samples */}
          <Text style={[styles.samplesLabel, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
            Quick phrases
          </Text>
          <View style={styles.samplesGrid}>
            {SAMPLE_PHRASES.slice(0, 4).map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.sampleChip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                onPress={() => speakSample(p)}
              >
                <Text style={[styles.sampleText, { color: colors.foreground, fontSize: 12 * fontSize }]} numberOfLines={1}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.typeArea}>
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
            placeholder="Type a message to translate to sign language…"
            placeholderTextColor={colors.mutedForeground}
            multiline
            maxLength={200}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.sendBtn,
          {
            backgroundColor:
              (mode === "mic" ? transcript : manualText).trim()
                ? colors.success
                : colors.muted,
          },
        ]}
        onPress={sendMessage}
        disabled={!(mode === "mic" ? transcript : manualText).trim()}
        activeOpacity={0.85}
      >
        <Feather
          name="send"
          size={18}
          color={(mode === "mic" ? transcript : manualText).trim() ? "#fff" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.sendText,
            {
              color: (mode === "mic" ? transcript : manualText).trim()
                ? "#fff"
                : colors.mutedForeground,
              fontSize: 15 * fontSize,
            },
          ]}
        >
          Send to conversation
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 18 },
  avatarCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  avatarLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, alignSelf: "flex-start" },
  avatarCenter: { width: "100%", alignItems: "center", paddingVertical: 10 },
  signingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  signingDot: { width: 7, height: 7, borderRadius: 3.5 },
  signingText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
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
  micArea: { alignItems: "center", gap: 16, paddingVertical: 10 },
  waveRow: { flexDirection: "row", gap: 6, alignItems: "center", height: 50 },
  wave: { width: 5, borderRadius: 3 },
  micBtn: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  micHint: { fontFamily: "Inter_400Regular" },
  transcriptBox: { borderRadius: 14, padding: 14, borderWidth: 1, minHeight: 80 },
  transcriptLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 8 },
  transcriptText: { fontFamily: "Inter_500Medium", lineHeight: 24 },
  samplesLabel: { fontFamily: "Inter_500Medium" },
  samplesGrid: { gap: 8 },
  sampleChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  sampleText: { fontFamily: "Inter_400Regular" },
  typeArea: { gap: 12 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 120,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlignVertical: "top",
  },
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
