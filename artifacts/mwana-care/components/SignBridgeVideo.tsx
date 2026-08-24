import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Icon } from "./Icon";

interface SignBridgeVideoProps {
  lessonId: string;
  onPlay?: () => void;
}

export function SignBridgeVideo({ lessonId, onPlay }: SignBridgeVideoProps) {
  const colors = useColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.care }]}>
      <View style={[styles.placeholder, { backgroundColor: colors.care + "22" }]}>
        <View style={[styles.playButton, { backgroundColor: colors.care }]}>
          <Icon name="play" size={32} color="#fff" />
        </View>
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          Sign-language video
        </Text>
        <Text style={[styles.placeholderSub, { color: colors.mutedForeground }]}>
          Lesson {lessonId}
        </Text>
      </View>
      
      <View style={[styles.infoBar, { backgroundColor: colors.care + "11" }]}>
        <View style={styles.infoContent}>
          <Icon name="users" size={16} color={colors.care} />
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            SignBridge Mode
          </Text>
        </View>
        <TouchableOpacity onPress={onPlay} style={[styles.playTextButton, { backgroundColor: colors.care + "22" }]}>
          <Text style={[styles.playText, { color: colors.care }]}>Play</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: "hidden",
    margin: 18,
  },
  placeholder: {
    aspectRatio: 16 / 9,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  placeholderSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  playTextButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
});
