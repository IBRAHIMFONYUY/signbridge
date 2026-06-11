import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp, Message } from "@/context/AppContext";
import { MessageBubble } from "@/components/MessageBubble";

export default function ConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, clearMessages, settings } = useApp();
  const listRef = useRef<FlatList>(null);
  const [showClear, setShowClear] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const prevLen = useRef(messages.length);
  const fs = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (messages.length > prevLen.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
    prevLen.current = messages.length;
  }, [messages.length]);

  const handleClear = useCallback(() => {
    if (!showClear) { setShowClear(true); setTimeout(() => setShowClear(false), 3000); return; }
    clearMessages();
    setShowClear(false);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [showClear, clearMessages]);

  const speakMsg = useCallback((msg: Message) => {
    if (playingId === msg.id) { Speech.stop(); setPlayingId(null); return; }
    Speech.stop();
    setPlayingId(msg.id);
    Speech.speak(msg.text, {
      rate: settings.speechRate, language: "en-US",
      onDone: () => setPlayingId(null), onStopped: () => setPlayingId(null), onError: () => setPlayingId(null),
    });
  }, [playingId, settings.speechRate]);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <MessageBubble message={item} largeText={settings.largeText} isPlaying={playingId === item.id} onSpeak={() => speakMsg(item)} />
  ), [settings.largeText, playingId, speakMsg]);

  const keyExtractor = useCallback((item: Message) => item.id, []);
  const deafCount = messages.filter((m) => m.sender === "deaf").length;
  const hearingCount = messages.filter((m) => m.sender === "hearing").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <LinearGradient
        colors={[colors.gradientStart + "aa", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: "#fff", fontSize: 20 * fs }]}>Conversation</Text>
            <Text style={[styles.headerSub, { color: "rgba(255,255,255,0.65)", fontSize: 12 * fs }]}>
              {deafCount} sign{deafCount !== 1 ? "s" : ""} · {hearingCount} speech
            </Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              style={[styles.clearBtn, {
                backgroundColor: showClear ? colors.destructive + "33" : "rgba(255,255,255,0.12)",
                borderColor: showClear ? colors.destructive : "rgba(255,255,255,0.2)",
              }]}
            >
              <Feather name="trash-2" size={14} color={showClear ? colors.destructive : "#fff"} />
              <Text style={[styles.clearText, { color: showClear ? colors.destructive : "#fff", fontSize: 12 * fs }]}>
                {showClear ? "Confirm?" : "Clear"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: "rgba(255,255,255,0.6)", fontSize: 11 * fs }]}>Deaf · Signs</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
            <Text style={[styles.legendText, { color: "rgba(255,255,255,0.6)", fontSize: 11 * fs }]}>Hearing · Speech</Text>
          </View>
          <View style={[styles.legendItem, { marginLeft: "auto" as any }]}>
            <Feather name="volume-2" size={10} color="rgba(255,255,255,0.5)" />
            <Text style={[styles.legendText, { color: "rgba(255,255,255,0.5)", fontSize: 11 * fs }]}>Tap to replay</Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyState colors={colors} fs={fs} />}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80), flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function EmptyState({ colors, fs }: { colors: any; fs: number }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Feather name="message-circle" size={30} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: 17 * fs }]}>No messages yet</Text>
      <Text style={[styles.emptySub, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
        Use Sign or Speech tabs to start communicating. Messages from both sides appear here.
      </Text>
      {[
        { icon: "camera" as const, text: "Sign Mode → gesture detected → Send & Speak" },
        { icon: "mic" as const, text: "Speech Mode → speak or type → Send — Speak & Sign" },
      ].map(({ icon, text }) => (
        <View key={text} style={[styles.hint, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name={icon} size={14} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.foreground, fontSize: 12 * fs }]}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 10 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  headerTitle: { fontFamily: "Inter_700Bold" },
  headerSub: { fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1 },
  clearText: { fontFamily: "Inter_500Medium" },
  legend: { flexDirection: "row", alignItems: "center", gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: "Inter_400Regular" },
  list: { paddingTop: 10 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 36, gap: 14 },
  emptyIcon: { width: 66, height: 66, borderRadius: 33, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, maxWidth: 280 },
  hint: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, width: "100%" as any },
  hintText: { fontFamily: "Inter_400Regular", flex: 1 },
});
