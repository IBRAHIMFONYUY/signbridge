import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
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
import { useApp, Message } from "@/context/AppContext";
import { MessageBubble } from "@/components/MessageBubble";

export default function ConversationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { messages, clearMessages, settings } = useApp();
  const listRef = useRef<FlatList>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const prevLength = useRef(messages.length);

  /* Auto-scroll when new message arrives */
  useEffect(() => {
    if (messages.length > prevLength.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
    prevLength.current = messages.length;
  }, [messages.length]);

  const handleClear = useCallback(() => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }
    clearMessages();
    setShowClearConfirm(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [showClearConfirm, clearMessages]);

  const speakMessage = useCallback(
    (msg: Message) => {
      if (playingId === msg.id) {
        Speech.stop();
        setPlayingId(null);
        return;
      }
      Speech.stop();
      setPlayingId(msg.id);
      Speech.speak(msg.text, {
        rate: settings.speechRate,
        language: "en-US",
        onDone: () => setPlayingId(null),
        onStopped: () => setPlayingId(null),
        onError: () => setPlayingId(null),
      });
    },
    [playingId, settings.speechRate]
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        largeText={settings.largeText}
        isPlaying={playingId === item.id}
        onSpeak={() => speakMessage(item)}
      />
    ),
    [settings.largeText, playingId, speakMessage]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
        <Feather name="message-circle" size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground, fontSize: 17 * fontSize }]}>
        No messages yet
      </Text>
      <Text style={[styles.emptySub, { color: colors.mutedForeground, fontSize: 13 * fontSize }]}>
        Use the Sign tab to translate gestures, or Speech tab to convert voice — messages appear here.
      </Text>
      <View style={styles.emptyHints}>
        {[
          { icon: "camera" as const, text: "Sign Mode → gesture → send" },
          { icon: "mic" as const, text: "Speech Mode → speak or type → send" },
        ].map(({ icon, text }) => (
          <View key={text} style={[styles.emptyHint, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name={icon} size={14} color={colors.primary} />
            <Text style={[styles.emptyHintText, { color: colors.foreground, fontSize: 12 * fontSize }]}>{text}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const deafCount = messages.filter((m) => m.sender === "deaf").length;
  const hearingCount = messages.filter((m) => m.sender === "hearing").length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingTop: topPad + 10,
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground, fontSize: 17 * fontSize }]}>
            Conversation
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            {deafCount} sign{deafCount !== 1 ? "s" : ""} · {hearingCount} speech
          </Text>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={[
              styles.clearBtn,
              {
                backgroundColor: showClearConfirm ? colors.destructive + "22" : colors.muted,
                borderColor: showClearConfirm ? colors.destructive : colors.border,
              },
            ]}
          >
            <Feather
              name="trash-2"
              size={14}
              color={showClearConfirm ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={[
                styles.clearText,
                { color: showClearConfirm ? colors.destructive : colors.mutedForeground, fontSize: 12 * fontSize },
              ]}
            >
              {showClearConfirm ? "Confirm" : "Clear"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.muted, borderBottomColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            Deaf User · Signs
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            Hearing User · Speech
          </Text>
        </View>
        <View style={[styles.legendItem, { marginLeft: "auto" }]}>
          <Feather name="volume-2" size={10} color={colors.mutedForeground} />
          <Text style={[styles.legendText, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            Tap to replay
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 80),
            flexGrow: 1,
          },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontFamily: "Inter_600SemiBold" },
  headerSub: { fontFamily: "Inter_400Regular", marginTop: 2 },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  clearText: { fontFamily: "Inter_500Medium" },
  legend: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: "Inter_400Regular" },
  list: { paddingTop: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 36, gap: 14 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, marginBottom: 4 },
  emptyHints: { gap: 8, width: "100%" },
  emptyHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyHintText: { fontFamily: "Inter_400Regular" },
});
