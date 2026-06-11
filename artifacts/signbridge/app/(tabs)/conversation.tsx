import React, { useCallback, useRef, useState } from "react";
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
  const fontSize = settings.largeText ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleClear = useCallback(() => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
      return;
    }
    clearMessages();
    setShowClearConfirm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [showClearConfirm, clearMessages]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} largeText={settings.largeText} />
    ),
    [settings.largeText]
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
        Start signing or speaking in the Sign or Speech tabs to begin a conversation.
      </Text>
    </View>
  );

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
          <Text style={[styles.headerSub, { color: colors.mutedForeground, fontSize: 12 * fontSize }]}>
            {messages.length} messages
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
                {
                  color: showClearConfirm ? colors.destructive : colors.mutedForeground,
                  fontSize: 12 * fontSize,
                },
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
            Deaf User (Signs)
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.mutedForeground, fontSize: 11 * fontSize }]}>
            Hearing User (Speech)
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
        scrollEnabled={!!messages.length}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            listRef.current?.scrollToEnd({ animated: true });
          }
        }}
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
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: "Inter_400Regular" },
  list: { paddingTop: 12 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 16 },
  emptyIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
