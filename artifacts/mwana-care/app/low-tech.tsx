import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";

type LowTechChannel = "ussd" | "sms" | "ivr";

export default function LowTechDemoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useMwana();
  const [selectedChannel, setSelectedChannel] = useState<LowTechChannel>("ussd");
  
  const USSD_MENU = [
    { code: "1", label: "Learn - Parenting Lessons", sub: "8 core lessons" },
    { code: "2", label: "Practice - Scenarios", sub: "Test your knowledge" },
    { code: "3", label: "Coach - Ask Question", sub: "Get guidance" },
    { code: "4", label: "Progress - Track Journey", sub: "View your stats" },
    { code: "5", label: "Settings - Language", sub: "EN/FR" },
    { code: "0", label: "Exit", sub: "End session" },
  ];
  
  const SMS_TEMPLATE = {
    welcome: "MWANA CARE: Welcome! Reply LEARN for lessons, PRACTICE for scenarios, COACH for guidance, PROGRESS for stats, HELP for menu. Msg&data rates may apply.",
    lesson: "MWANA CARE: Today's 5-min activity: Positive Discipline. Reply DONE when complete. Next: Understanding Your Child.",
    reminder: "MWANA CARE: 🔥 You're on a 5-day streak! Take 5 mins today for 'Responding Without Violence'. Reply START to begin.",
    streak: "MWANA CARE: Great job! You completed 3 lessons this week. Keep going! Reply NEXT for your next lesson.",
  };
  
  const IVR_SCRIPT = {
    welcome: [
      "Thank you for calling MWANA CARE.",
      "Nurturing Parents. Including Every Child.",
      "Press 1 for English. Appuyez sur 2 pour le français.",
    ],
    menu: [
      "Main Menu:",
      "Press 1 for Parenting Lessons.",
      "Press 2 for Practice Scenarios.",
      "Press 3 for Coach Guidance.",
      "Press 4 to check your Progress.",
      "Press 0 to exit.",
    ],
    lesson: [
      "Today's lesson: Positive Discipline.",
      "Duration: 5 minutes.",
      "Press 1 to start.",
      "Press 2 to skip to next lesson.",
      "Press 0 to return to main menu.",
    ],
  };

  const renderUSSD = () => (
    <View style={styles.channelContent}>
      <Card style={styles.ussdCard} variant="elevated">
        <View style={styles.ussdHeader}>
          <View style={[styles.ussdBadge, { backgroundColor: colors.primary + "22" }]}>
            <Icon name="hash" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.ussdTitle, { color: colors.foreground }]}>
            USSD Menu
          </Text>
        </View>
        
        <View style={[styles.ussdCode, { backgroundColor: colors.input }]}>
          <Text style={[styles.ussdCodeText, { color: colors.mutedForeground }]}>
            *123#
          </Text>
        </View>
        
        <Text style={[styles.ussdSubtitle, { color: colors.mutedForeground }]}>
          Dial this code on any phone
        </Text>
      </Card>
      
      <Card style={styles.menuCard}>
        <Text style={[styles.menuTitle, { color: colors.foreground }]}>
          MWANA CARE Menu
        </Text>
        
        {USSD_MENU.map((item) => (
          <View key={item.code} style={styles.menuItem}>
            <View style={[styles.menuCode, { backgroundColor: colors.primary }]}>
              <Text style={[styles.menuCodeText, { color: "#fff" }]}>{item.code}</Text>
            </View>
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.menuItemSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
            </View>
          </View>
        ))}
      </Card>
      
      <Card style={styles.infoCard}>
        <Icon name="info" size={16} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          USSD works on any phone, no data required. Parents can access content via simple menu navigation.
        </Text>
      </Card>
    </View>
  );

  const renderSMS = () => (
    <View style={styles.channelContent}>
      <Card style={styles.smsCard} variant="elevated">
        <View style={styles.smsHeader}>
          <View style={[styles.smsBadge, { backgroundColor: colors.success + "22" }]}>
            <Icon name="message-square" size={20} color={colors.success} />
          </View>
          <Text style={[styles.smsTitle, { color: colors.foreground }]}>
            SMS Templates
          </Text>
        </View>
        
        <Text style={[styles.smsSubtitle, { color: colors.mutedForeground }]}>
          Automated messages for engagement
        </Text>
      </Card>
      
      <Card style={styles.messageCard}>
        <Badge variant="primary" size="sm">Welcome</Badge>
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {SMS_TEMPLATE.welcome}
        </Text>
      </Card>
      
      <Card style={styles.messageCard}>
        <Badge variant="success" size="sm">Daily Lesson</Badge>
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {SMS_TEMPLATE.lesson}
        </Text>
      </Card>
      
      <Card style={styles.messageCard}>
        <Badge variant="warning" size="sm">Streak Reminder</Badge>
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {SMS_TEMPLATE.reminder}
        </Text>
      </Card>
      
      <Card style={styles.messageCard}>
        <Badge variant="accent" size="sm">Completion</Badge>
        <Text style={[styles.messageText, { color: colors.foreground }]}>
          {SMS_TEMPLATE.streak}
        </Text>
      </Card>
      
      <Card style={styles.infoCard}>
        <Icon name="info" size={16} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          SMS delivery works on all phones. Interactive quizzes via 2-way SMS enable learning without data.
        </Text>
      </Card>
    </View>
  );

  const renderIVR = () => (
    <View style={styles.channelContent}>
      <Card style={styles.ivrCard} variant="elevated">
        <View style={styles.ivrHeader}>
          <View style={[styles.ivrBadge, { backgroundColor: colors.accent + "22" }]}>
            <Icon name="phone" size={20} color={colors.accent} />
          </View>
          <Text style={[styles.ivrTitle, { color: colors.foreground }]}>
            IVR Script
          </Text>
        </View>
        
        <Text style={[styles.ivrSubtitle, { color: colors.mutedForeground }]}>
          Interactive Voice Response for audio learning
        </Text>
      </Card>
      
      <Card style={styles.scriptCard}>
        <Text style={[styles.scriptTitle, { color: colors.foreground }]}>
          Welcome Message
        </Text>
        {IVR_SCRIPT.welcome.map((line, index) => (
          <View key={index} style={styles.scriptLine}>
            <Text style={[styles.scriptNumber, { color: colors.primary }]}>{index + 1}.</Text>
            <Text style={[styles.scriptText, { color: colors.foreground }]}>{line}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.scriptCard}>
        <Text style={[styles.scriptTitle, { color: colors.foreground }]}>
          Main Menu
        </Text>
        {IVR_SCRIPT.menu.map((line, index) => (
          <View key={index} style={styles.scriptLine}>
            <Text style={[styles.scriptNumber, { color: colors.primary }]}>{index + 1}.</Text>
            <Text style={[styles.scriptText, { color: colors.foreground }]}>{line}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.scriptCard}>
        <Text style={[styles.scriptTitle, { color: colors.foreground }]}>
          Lesson Delivery
        </Text>
        {IVR_SCRIPT.lesson.map((line, index) => (
          <View key={index} style={styles.scriptLine}>
            <Text style={[styles.scriptNumber, { color: colors.primary }]}>{index + 1}.</Text>
            <Text style={[styles.scriptText, { color: colors.foreground }]}>{line}</Text>
          </View>
        ))}
      </Card>
      
      <Card style={styles.infoCard}>
        <Icon name="info" size={16} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          IVR enables audio learning for low-literacy users. Content delivered in local languages.
        </Text>
      </Card>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Low-Tech Demo
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Multi-Channel Architecture
          </Text>
        </View>

        {/* Channel Selector */}
        <View style={styles.channelSelector}>
          <TouchableOpacity
            onPress={() => setSelectedChannel("ussd")}
            style={[
              styles.channelTab,
              selectedChannel === "ussd"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Icon
              name="hash"
              size={16}
              color={selectedChannel === "ussd" ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.channelTabText,
                { color: selectedChannel === "ussd" ? "#fff" : colors.foreground },
              ]}
            >
              USSD
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSelectedChannel("sms")}
            style={[
              styles.channelTab,
              selectedChannel === "sms"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Icon
              name="message-square"
              size={16}
              color={selectedChannel === "sms" ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.channelTabText,
                { color: selectedChannel === "sms" ? "#fff" : colors.foreground },
              ]}
            >
              SMS
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setSelectedChannel("ivr")}
            style={[
              styles.channelTab,
              selectedChannel === "ivr"
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Icon
              name="phone"
              size={16}
              color={selectedChannel === "ivr" ? "#fff" : colors.mutedForeground}
            />
            <Text
              style={[
                styles.channelTabText,
                { color: selectedChannel === "ivr" ? "#fff" : colors.foreground },
              ]}
            >
              IVR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Channel Content */}
        {selectedChannel === "ussd" && renderUSSD()}
        {selectedChannel === "sms" && renderSMS()}
        {selectedChannel === "ivr" && renderIVR()}

        {/* Architecture Note */}
        <Card style={styles.architectureCard} variant="elevated">
          <View style={styles.architectureHeader}>
            <View style={[styles.architectureBadge, { backgroundColor: colors.care + "22" }]}>
              <Icon name="layers" size={20} color={colors.care} />
            </View>
            <Text style={[styles.architectureTitle, { color: colors.foreground }]}>
              Content Engine Architecture
            </Text>
          </View>
          
          <Text style={[styles.architectureText, { color: colors.mutedForeground }]}>
            The same parenting content is adapted for each channel:
          </Text>
          
          <View style={styles.architectureList}>
            <View style={styles.architectureItem}>
              <View style={[styles.architectureDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.architectureItemText, { color: colors.foreground }]}>
                PWA: Full interactive experience with videos
              </Text>
            </View>
            <View style={styles.architectureItem}>
              <View style={[styles.architectureDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.architectureItemText, { color: colors.foreground }]}>
                USSD: Text-based menu navigation
              </Text>
            </View>
            <View style={styles.architectureItem}>
              <View style={[styles.architectureDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.architectureItemText, { color: colors.foreground }]}>
                SMS: Interactive message threads
              </Text>
            </View>
            <View style={styles.architectureItem}>
              <View style={[styles.architectureDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.architectureItemText, { color: colors.foreground }]}>
                IVR: Audio content in local languages
              </Text>
            </View>
          </View>
          
          <Text style={[styles.architectureNote, { color: colors.mutedForeground }]}>
            This ensures universal reach across all connectivity levels and device types.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  channelSelector: {
    flexDirection: "row",
    paddingHorizontal: 18,
    marginBottom: 20,
    gap: 8,
  },
  channelTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  channelTabText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  channelContent: {
    paddingHorizontal: 18,
    gap: 16,
  },
  ussdCard: {
    padding: 20,
    alignItems: "center",
  },
  ussdHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  ussdBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  ussdTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  ussdCode: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  ussdCodeText: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 2,
  },
  ussdSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  menuCard: {
    padding: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  menuCode: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuCodeText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  menuItemSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  smsCard: {
    padding: 20,
    alignItems: "center",
  },
  smsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  smsBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  smsTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  smsSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  messageCard: {
    padding: 16,
    gap: 8,
  },
  messageText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  ivrCard: {
    padding: 20,
    alignItems: "center",
  },
  ivrHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  ivrBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  ivrTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  ivrSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  scriptCard: {
    padding: 16,
  },
  scriptTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  scriptLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 6,
  },
  scriptNumber: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    minWidth: 20,
  },
  scriptText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  architectureCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  architectureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  architectureBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  architectureTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  architectureText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  architectureList: {
    gap: 12,
    marginBottom: 16,
  },
  architectureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  architectureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  architectureItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  architectureNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
});
