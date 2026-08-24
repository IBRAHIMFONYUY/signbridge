import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/Badge";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";
import { LESSONS, getLessonsByCategory } from "@/content/lessons";

const CATEGORIES = [
  { id: "communication", label: "Communication", color: "#2563eb" },
  { id: "discipline", label: "Discipline", color: "#059669" },
  { id: "emotions", label: "Emotions", color: "#ec4899" },
  { id: "safety", label: "Safety", color: "#d97706" },
  { id: "development", label: "Development", color: "#0891b2" },
];

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, lessonProgress, practiceProgress, streak, signBridgeEnabled, setSignBridgeEnabled } = useMwana();
  
  const completedLessons = lessonProgress.filter((p) => p.completed).length;
  const totalProgress = completedLessons / LESSONS.length;
  const completedScenarios = practiceProgress.filter((p) => p.completed).length;
  
  const getCategoryProgress = (categoryId: string) => {
    const categoryLessons = getLessonsByCategory(categoryId as any);
    const completedInCategory = categoryLessons.filter((lesson) =>
      lessonProgress.find((p) => p.lessonId === lesson.id)?.completed
    ).length;
    return completedInCategory / categoryLessons.length;
  };

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
            {profile?.language === "fr" ? "Votre progression" : "Your Progress"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {profile?.language === "fr" 
              ? "Suivez votre voyage de parentalité"
              : "Track your parenting journey"}
          </Text>
        </View>

        {/* Streak Card */}
        <Card style={styles.streakCard} variant="elevated">
          <View style={styles.streakContent}>
            <View style={[styles.streakIcon, { backgroundColor: colors.warning + "22" }]}>
              <Icon name="zap" size={32} color={colors.warning} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={[styles.streakValue, { color: colors.foreground }]}>
                {streak.currentStreak}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "journée(s) consécutive(s)" : "day streak"}
              </Text>
            </View>
            <View style={styles.streakBest}>
              <Text style={[styles.streakBestLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Meilleur" : "Best"}
              </Text>
              <Text style={[styles.streakBestValue, { color: colors.warning }]}>
                {streak.longestStreak}
              </Text>
            </View>
          </View>
        </Card>

        {/* Overall Progress */}
        <Card style={styles.overallCard}>
          <View style={styles.overallHeader}>
            <Text style={[styles.overallTitle, { color: colors.foreground }]}>
              {profile?.language === "fr" ? "Progression globale" : "Overall Progress"}
            </Text>
            <Badge variant="primary" size="md">
              {Math.round(totalProgress * 100)}%
            </Badge>
          </View>
          <ProgressBar progress={totalProgress} height={12} style={styles.overallBar} />
          <View style={styles.overallStats}>
            <View style={styles.overallStat}>
              <Text style={[styles.overallStatValue, { color: colors.primary }]}>
                {completedLessons}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Leçons" : "Lessons"}
              </Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={[styles.overallStatValue, { color: colors.success }]}>
                {completedScenarios}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Scénarios" : "Scenarios"}
              </Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={[styles.overallStatValue, { color: colors.accent }]}>
                {lessonProgress.reduce((acc, p) => acc + p.timeSpent, 0) / 60}
              </Text>
              <Text style={[styles.overallStatLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Minutes" : "Minutes"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Category Progress */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {profile?.language === "fr" ? "Progression par catégorie" : "Progress by Category"}
          </Text>
          
          {CATEGORIES.map((category) => {
            const progress = getCategoryProgress(category.id);
            const categoryLessons = getLessonsByCategory(category.id as any);
            const completedInCategory = categoryLessons.filter((lesson) =>
              lessonProgress.find((p) => p.lessonId === lesson.id)?.completed
            ).length;
            
            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => router.push("/learn")}
                style={[styles.categoryProgressCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.categoryProgressHeader}>
                  <View style={[styles.categoryProgressIcon, { backgroundColor: category.color + "22" }]}>
                    <Icon name={category.id === "communication" ? "message-circle" : category.id === "discipline" ? "shield" : category.id === "emotions" ? "heart" : category.id === "safety" ? "lock" : "smile"} size={20} color={category.color} />
                  </View>
                  <View style={styles.categoryProgressInfo}>
                    <Text style={[styles.categoryProgressLabel, { color: colors.foreground }]}>
                      {category.label}
                    </Text>
                    <Text style={[styles.categoryProgressSub, { color: colors.mutedForeground }]}>
                      {completedInCategory}/{categoryLessons.length} {profile?.language === "fr" ? "complétées" : "completed"}
                    </Text>
                  </View>
                  <Text style={[styles.categoryProgressPercent, { color: category.color }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
                <ProgressBar progress={progress} height={6} color={category.color} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Accessibility Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {profile?.language === "fr" ? "Accessibilité" : "Accessibility"}
          </Text>
          <AccessibilityToggle />
        </View>

        {/* Achievements (placeholder) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {profile?.language === "fr" ? "Réalisations" : "Achievements"}
          </Text>
          
          <View style={styles.achievementsGrid}>
            {[
              { icon: "check-circle", label: profile?.language === "fr" ? "Première leçon" : "First lesson", unlocked: completedLessons >= 1, color: colors.success },
              { icon: "zap", label: profile?.language === "fr" ? "Série de 3 jours" : "3-day streak", unlocked: streak.longestStreak >= 3, color: colors.warning },
              { icon: "target", label: profile?.language === "fr" ? "Premier scénario" : "First scenario", unlocked: completedScenarios >= 1, color: colors.accent },
              { icon: "award", label: profile?.language === "fr" ? "50% complété" : "50% complete", unlocked: totalProgress >= 0.5, color: colors.primary },
            ].map((achievement) => (
              <View
                key={achievement.label}
                style={[
                  styles.achievementCard,
                  achievement.unlocked
                    ? { backgroundColor: achievement.color + "22", borderColor: achievement.color }
                    : { backgroundColor: colors.muted, borderColor: colors.border },
                ]}
              >
                <Icon
                  name={achievement.icon as any}
                  size={24}
                  color={achievement.unlocked ? achievement.color : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.achievementLabel,
                    { color: achievement.unlocked ? achievement.color : colors.mutedForeground },
                  ]}
                >
                  {achievement.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recommended Next */}
        {completedLessons < LESSONS.length && (
          <Card style={styles.recommendedCard} variant="elevated">
            <View style={styles.recommendedHeader}>
              <View style={[styles.recommendedBadge, { backgroundColor: colors.primary + "22" }]}>
                <Icon name="arrow-right" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.recommendedTitle, { color: colors.foreground }]}>
                {profile?.language === "fr" ? "Recommandé ensuite" : "Recommended Next"}
              </Text>
            </View>
            
            {LESSONS.filter((lesson) => !lessonProgress.find((p) => p.lessonId === lesson.id)?.completed).slice(0, 1).map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={styles.recommendedLesson}
              >
                <View style={[styles.recommendedLessonIcon, { backgroundColor: colors.warm + "22" }]}>
                  <Icon name="book-open" size={20} color={colors.warm} />
                </View>
                <View style={styles.recommendedLessonInfo}>
                  <Text style={[styles.recommendedLessonTitle, { color: colors.foreground }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.recommendedLessonMeta, { color: colors.mutedForeground }]}>
                    {lesson.duration} min • {lesson.category}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </Card>
        )}
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
  streakCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  streakIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  streakLabel: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  streakBest: {
    alignItems: "flex-end",
  },
  streakBestLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  streakBestValue: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  overallCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  overallHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  overallBar: {
    marginBottom: 16,
  },
  overallStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  overallStat: {
    alignItems: "center",
  },
  overallStatValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  overallStatLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  section: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  categoryProgressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  categoryProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryProgressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryProgressInfo: {
    flex: 1,
  },
  categoryProgressLabel: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  categoryProgressSub: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  categoryProgressPercent: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  achievementLabel: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  recommendedCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 16,
  },
  recommendedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  recommendedBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  recommendedLesson: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    gap: 12,
  },
  recommendedLessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  recommendedLessonInfo: {
    flex: 1,
  },
  recommendedLessonTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  recommendedLessonMeta: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
});
