import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, Message } from "@/context/AppContext";
import { MessageBubble } from "@/components/MessageBubble";
import { HandAvatarPro } from "@/components/HandAvatarPro";
import { useSignQueue } from "@/hooks/useSignQueue";
import { textToGestureSequence } from "@/utils/textToSign";

export default function ConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, clearMessages, settings } = useApp();
  const listRef = useRef<FlatList>(null);
  const [showClear, setShowClear] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const signQueue = useSignQueue(1000);
  const [activeReplayId, setActiveReplayId] = useState<string | null>(null);

  const prevLen = useRef(messages.length);
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const deafCount = messages.filter((m) => m.sender === "deaf").length;
  const hearingCount = messages.filter((m) => m.sender === "hearing").length;

  /* Auto-scroll on new message */
  useEffect(() => {
    if (messages.length > prevLen.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      // Auto-sign the last hearing message for the deaf user
      const last = messages[messages.length - 1];
      if (last?.sender === "hearing") {
        signQueue.play(textToGestureSequence(last.text));
      }
    }
    prevLen.current = messages.length;
  }, [messages.length]);

  const handleClear = useCallback(() => {
    if (!showClear) {
      setShowClear(true);
      setTimeout(() => setShowClear(false), 3000);
      return;
    }
    clearMessages();
    setShowClear(false);
    signQueue.clear();
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [showClear, clearMessages, signQueue]);

  const speakMsg = useCallback(
    (msg: Message) => {
      if (playingId === msg.id) {
        Speech.stop();
        setPlayingId(null);
        return;
      }
      Speech.stop();
      setPlayingId(msg.id);
      // Also sign the message via avatar
      if (msg.sender === "hearing") {
        setActiveReplayId(msg.id);
        signQueue.play(textToGestureSequence(msg.text), () => setActiveReplayId(null));
      }
      Speech.speak(msg.text, {
        rate: settings.speechRate,
        language: "en-US",
        onDone: () => setPlayingId(null),
        onStopped: () => setPlayingId(null),
        onError: () => setPlayingId(null),
      });
    },
    [playingId, settings.speechRate, signQueue]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        largeText={settings.largeText}
        isPlaying={playingId === item.id}
        onSpeak={() => speakMsg(item)}
      />
    ),
    [settings.largeText, playingId, speakMsg]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── Header ── */}
      <LinearGradient
        colors={[colors.gradientStart + "aa", colors.background]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: "#fff", fontSize: 20 * fs }]}>
              Conversation
            </Text>
            <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.6)", fontSize: 11 * fs }]}>
              {deafCount} sign{deafCount !== 1 ? "s" : ""} · {hearingCount} speech
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={[
                styles.clearBtn,
                {
                  backgroundColor: showClear ? colors.destructive + "33" : "rgba(255,255,255,0.12)",
                  borderColor: showClear ? colors.destructive : "rgba(255,255,255,0.2)",
                },
              ]}
            >
              <Feather name="trash-2" size={13} color={showClear ? colors.destructive : "#fff"} />
              <Text style={[styles.clearText, { color: showClear ? colors.destructive : "#fff", fontSize: 12 * fs }]}>
                {showClear ? "Confirm clear?" : "Clear"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: "rgba(255,255,255,0.6)", fontSize: 10 * fs }]}>
              Deaf · Signs → Text → Voice
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.legendText, { color: "rgba(255,255,255,0.6)", fontSize: 10 * fs }]}>
              Hearing · Voice → Signs
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Live avatar panel (shows when hearing message was sent) ── */}
      {signQueue.isSigning && (
        <View style={[styles.avatarPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.avatarPanelLeft}>
            <Text style={[styles.avatarPanelLabel, { color: colors.mutedForeground, fontSize: 10 * fs }]}>
              SIGNING FOR DEAF USER
            </Text>
            <Text style={[styles.avatarPanelGesture, { color: colors.primary, fontSize: 13 * fs }]}>
              {signQueue.currentGesture}
            </Text>
            {/* Progress dots */}
            <View style={styles.dotsRow}>
              {Array.from({ length: signQueue.total }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i <= signQueue.currentIndex ? colors.primary : colors.border,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          <HandAvatarPro
            gesture={signQueue.currentGesture}
            size={80}
            primaryColor={colors.primary}
          />
        </View>
      )}

      {/* ── Messages ── */}
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyState colors={colors} fs={fs} />}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
      />
    </View>
  );
}

function EmptyState({ colors, fs }: { colors: any; fs: number }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Feather name="message-circle" size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: 17 * fs }]}>
        No messages yet
      </Text>
      <Text style={[styles.emptySub, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
        Start a conversation from Sign or Speech. Both sides appear here in real-time.
      </Text>
      <View style={styles.flowCards}>
        {[
          { icon: "camera" as const, title: "Deaf → Hearing", body: "Signs → Landmarks → Text → Voice", color: colors.primary },
          { icon: "mic" as const, title: "Hearing → Deaf", body: "Voice → Text → Avatar Signs", color: colors.accent },
        ].map(({ icon, title, body, color }) => (
          <View key={title} style={[styles.flowCard, { backgroundColor: color + "12", borderColor: color + "30" }]}>
            <Feather name={icon} size={16} color={color} />
            <Text style={[styles.flowTitle, { color: colors.foreground, fontSize: 12 * fs }]}>{title}</Text>
            <Text style={[styles.flowBody, { color: colors.mutedForeground, fontSize: 11 * fs }]}>{body}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 14, gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerTitle: { fontFamily: "Inter_700Bold" },
  headerSub: { fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearText: { fontFamily: "Inter_500Medium" },
  legend: { flexDirection: "row", gap: 16, alignItems: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: "Inter_400Regular" },
  avatarPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatarPanelLeft: { flex: 1, gap: 4 },
  avatarPanelLabel: { fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  avatarPanelGesture: { fontFamily: "Inter_600SemiBold", letterSpacing: 1 },
  dotsRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  list: { paddingTop: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  emptyIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, maxWidth: 280 },
  flowCards: { gap: 10, width: "100%" as any, marginTop: 4 },
  flowCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 5 },
  flowTitle: { fontFamily: "Inter_600SemiBold" },
  flowBody: { fontFamily: "Inter_400Regular", lineHeight: 17 },
});
