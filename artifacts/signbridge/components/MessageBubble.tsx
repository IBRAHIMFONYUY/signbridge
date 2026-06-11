import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Message } from "@/context/AppContext";

interface Props {
  message: Message;
  largeText?: boolean;
  isPlaying?: boolean;
  onSpeak?: () => void;
}

export function MessageBubble({ message, largeText, isPlaying, onSpeak }: Props) {
  const colors = useColors();
  const isDeaf = message.sender === "deaf";

  const timeStr = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={[styles.row, isDeaf ? styles.rowLeft : styles.rowRight]}>
      {isDeaf && (
        <View style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}>
          <Feather name="camera" size={13} color={colors.primary} />
        </View>
      )}
      <View style={styles.bubbleWrap}>
        <Text style={[styles.senderLabel, { color: colors.mutedForeground }]}>
          {isDeaf ? "Deaf User" : "Hearing User"}
        </Text>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isDeaf ? colors.primary : colors.card,
              borderColor: isDeaf ? "transparent" : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              {
                color: isDeaf ? colors.primaryForeground : colors.foreground,
                fontSize: largeText ? 18 : 15,
              },
            ]}
          >
            {message.text}
          </Text>
        </View>
        <View style={[styles.meta, isDeaf ? styles.metaLeft : styles.metaRight]}>
          <Feather
            name={message.type === "sign" ? "camera" : "mic"}
            size={10}
            color={colors.mutedForeground}
          />
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeStr}</Text>
          {onSpeak && (
            <TouchableOpacity onPress={onSpeak} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Feather
                name={isPlaying ? "volume-x" : "volume-2"}
                size={12}
                color={isPlaying ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {!isDeaf && (
        <View style={[styles.avatar, { backgroundColor: colors.accent + "33" }]}>
          <Feather name="mic" size={13} color={colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, marginVertical: 4, paddingHorizontal: 16 },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    flexShrink: 0,
  },
  bubbleWrap: { maxWidth: "75%", gap: 3 },
  senderLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginHorizontal: 4 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  text: { fontFamily: "Inter_400Regular", lineHeight: 22 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5, marginHorizontal: 4 },
  metaLeft: { justifyContent: "flex-start" },
  metaRight: { justifyContent: "flex-end" },
  time: { fontSize: 10, fontFamily: "Inter_400Regular" },
});
