import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/Badge";
import { LESSONS } from "@/content/lessons";

const CATEGORIES = [
  { id: "communication", label: "Communication", icon: "message-circle", color: "#2563eb" },
  { id: "discipline", label: "Discipline", icon: "shield", color: "#059669" },
  { id: "emotions", label: "Emotions", icon: "heart", color: "#ec4899" },
  { id: "safety", label: "Child Safety", icon: "lock", color: "#d97706" },
  { id: "development", label: "Child Development", icon: "smile", color: "#0891b2" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, lessonProgress, streak, updateStreak } = useMwana();
  const fs = colors.radius > 16 ? 1.2 : 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Update streak when home screen is accessed
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  // Get today's recommended lesson (first incomplete lesson)
  const todayLesson = LESSONS.find((lesson) => {
    const progress = lessonProgress.find((p) => p.lessonId === lesson.id);
    return !progress?.completed;
  }) || LESSONS[0];

  const completedLessons = lessonProgress.filter((p) => p.completed).length;
  const totalProgress = completedLessons / LESSONS.length;

  if (!profile?.onboardingCompleted) {
    router.replace("/onboarding");
    return null;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero gradient header */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, colors.background]}
        locations={[0, 0.6, 1]}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        <View style={styles.heroInner}>
          <View style={styles.greetingRow}>
            <Text style={[styles.greeting, { fontSize: 14 * fs, color: "rgba(255,255,255,0.85)" }]}>
              {profile.language === "fr" ? "Bonjour" : "Good morning"} 👋
            </Text>
            {streak.currentStreak > 0 && (
              <Badge variant="success" size="sm">
                🔥 {streak.currentStreak} day streak
              </Badge>
            )}
          </View>
          <Text style={[styles.heroTitle, { fontSize: 28 * fs, color: "#fff" }]}>
            {profile.name || "Parent"}
          </Text>
          <Text style={[styles.heroSubtitle, { fontSize: 13 * fs, color: "rgba(255,255,255,0.8)" }]}>
            {profile.language === "fr" 
              ? "Votre voyage de parentalité positive continue" 
              : "Your positive parenting journey continues"}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Today's Activity Card */}
        <Card style={styles.todayCard} variant="elevated">
          <View style={styles.todayHeader}>
            <View style={[styles.todayBadge, { backgroundColor: colors.primary + "22" }]}>
              <Icon name="sun" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.todayLabel, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
              {profile.language === "fr" ? "Activité du jour" : "Today's 5-minute activity"}
            </Text>
          </View>
          
          <View style={styles.todayContent}>
            <View style={[styles.lessonIcon, { backgroundColor: colors.warm + "22" }]}>
              <Icon name="clock" size={24} color={colors.warm} />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={[styles.lessonTitle, { color: colors.foreground, fontSize: 18 * fs }]}>
                {todayLesson.title}
              </Text>
              <Text style={[styles.lessonMeta, { color: colors.mutedForeground, fontSize: 13 * fs }]}>
                {todayLesson.duration} min • {todayLesson.category}
              </Text>
            </View>
          </View>
          
          <Button
            onPress={() => router.push(`/lesson/${todayLesson.id}`)}
            fullWidth
          >
            {profile.language === "fr" ? "Commencer" : "Start"}
          </Button>
        </Card>

        {/* Quick Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: 16 * fs }]}>
            {profile.language === "fr" ? "De quoi avez-vous besoin ?" : "What do you need help with?"}
          </Text>
        </View>
        
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => router.push("/learn")}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + "22" }]}>
                <Icon name={category.icon as any} size={20} color={category.color} />
              </View>
              <Text style={[styles.categoryLabel, { color: colors.foreground, fontSize: 13 * fs }]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Overview */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.foreground, fontSize: 15 * fs }]}>
              {profile.language === "fr" ? "Votre progression" : "Your Progress"}
            </Text>
            <Text style={[styles.progressCount, { color: colors.primary, fontSize: 20 * fs }]}>
              {completedLessons}/{LESSONS.length}
            </Text>
          </View>
          <ProgressBar progress={totalProgress} height={8} />
          <Text style={[styles.progressText, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
            {profile.language === "fr" 
              ? `${Math.round(totalProgress * 100)}% complété`
              : `${Math.round(totalProgress * 100)}% complete`}
          </Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => router.push("/coach")}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + "22" }]}>
              <Icon name="message-circle" size={20} color={colors.accent} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground, fontSize: 13 * fs }]}>
              {profile.language === "fr" ? "Coach" : "Coach"}
            </Text>
            <Text style={[styles.actionSub, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              {profile.language === "fr" ? "Poser une question" : "Ask a question"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push("/practice")}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border, flex: 1 }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success + "22" }]}>
              <Icon name="target" size={20} color={colors.success} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground, fontSize: 13 * fs }]}>
              {profile.language === "fr" ? "Pratique" : "Practice"}
            </Text>
            <Text style={[styles.actionSub, { color: colors.mutedForeground, fontSize: 11 * fs }]}>
              {profile.language === "fr" ? "Scénarios" : "Scenarios"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SignBridge Promotion */}
        {!profile.signBridgeEnabled && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/progress")}
            style={[styles.signbridgeCard, { backgroundColor: colors.care + "22", borderColor: colors.care + "55" }]}
          >
            <View style={[styles.signbridgeIcon, { backgroundColor: colors.care }]}>
              <Icon name="users" size={20} color="#fff" />
            </View>
            <View style={styles.signbridgeContent}>
              <Text style={[styles.signbridgeTitle, { color: colors.foreground, fontSize: 14 * fs }]}>
                SignBridge Mode
              </Text>
              <Text style={[styles.signbridgeText, { color: colors.mutedForeground, fontSize: 12 * fs }]}>
                {profile.language === "fr" 
                  ? "Activez le support en langue des signes"
                  : "Enable sign-language support"}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { paddingBottom: 32, paddingHorizontal: 24 },
  heroInner: { gap: 8 },
  greetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: { fontFamily: "Inter_500Medium" },
  heroTitle: { fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroSubtitle: { fontFamily: "Inter_400Regular", lineHeight: 18 },
  body: { paddingHorizontal: 18, gap: 20, marginTop: -4 },
  todayCard: { padding: 20, gap: 16 },
  todayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  todayBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  todayLabel: { fontFamily: "Inter_500Medium" },
  todayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontFamily: "Inter_600SemiBold" },
  lessonMeta: { fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionHeader: { paddingHorizontal: 6 },
  sectionTitle: { fontFamily: "Inter_600SemiBold" },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryLabel: { fontFamily: "Inter_500Medium", textAlign: "center" },
  progressCard: { padding: 18, gap: 12 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: { fontFamily: "Inter_600SemiBold" },
  progressCount: { fontFamily: "Inter_700Bold" },
  progressText: { fontFamily: "Inter_400Regular", marginTop: 4 },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { fontFamily: "Inter_600SemiBold" },
  actionSub: { fontFamily: "Inter_400Regular", textAlign: "center" },
  signbridgeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  signbridgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  signbridgeContent: { flex: 1 },
  signbridgeTitle: { fontFamily: "Inter_600SemiBold" },
  signbridgeText: { fontFamily: "Inter_400Regular", marginTop: 2 },
});
