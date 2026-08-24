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
import { LESSONS, getLessonsByCategory } from "@/content/lessons";

const CATEGORIES = [
  { id: "communication", label: "Communication", icon: "message-circle" },
  { id: "discipline", label: "Discipline", icon: "shield" },
  { id: "emotions", label: "Emotions", icon: "heart" },
  { id: "safety", label: "Safety", icon: "lock" },
  { id: "development", label: "Development", icon: "smile" },
];

export default function LearnScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, lessonProgress } = useMwana();
  
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  
  const displayedLessons = selectedCategory 
    ? getLessonsByCategory(selectedCategory as any)
    : LESSONS;
  
  const getLessonProgress = (lessonId: string) => {
    const progress = lessonProgress.find((p) => p.lessonId === lessonId);
    return progress?.completed ? 1 : progress ? 0.5 : 0;
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
            MWANA Learn
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {profile?.language === "fr" 
              ? "Leçons de parentalité positive"
              : "Positive parenting lessons"}
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              !selectedCategory 
                ? { backgroundColor: colors.primary } 
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                { color: !selectedCategory ? "#fff" : colors.foreground },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Icon
                name={category.icon as any}
                size={14}
                color={selectedCategory === category.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === category.id ? "#fff" : colors.foreground },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          {displayedLessons.map((lesson, index) => {
            const progress = getLessonProgress(lesson.id);
            const isCompleted = progress === 1;
            
            return (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                activeOpacity={0.7}
              >
                <Card style={styles.lessonCard} variant="outlined">
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonNumber}>
                      <Text style={[styles.lessonNumberText, { color: colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.lessonMeta}>
                      <Badge variant="primary" size="sm">
                        {lesson.category}
                      </Badge>
                      <Text style={[styles.duration, { color: colors.mutedForeground }]}>
                        {lesson.duration} min
                      </Text>
                    </View>
                    {isCompleted && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success + "22" }]}>
                        <Icon name="check" size={16} color={colors.success} />
                      </View>
                    )}
                  </View>
                  
                  <Text style={[styles.lessonTitle, { color: colors.foreground }]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonDescription, { color: colors.mutedForeground }]}>
                    {lesson.description}
                  </Text>
                  
                  <ProgressBar progress={progress} height={4} style={styles.progressBar} />
                  
                  <View style={styles.lessonFooter}>
                    <View style={styles.formats}>
                      {lesson.formats.signbridge && (
                        <View style={[styles.formatTag, { backgroundColor: colors.care + "22" }]}>
                          <Icon name="users" size={10} color={colors.care} />
                        </View>
                      )}
                      {lesson.formats.lowLiteracy && (
                        <View style={[styles.formatTag, { backgroundColor: colors.accent + "22" }]}>
                          <Icon name="eye" size={10} color={colors.accent} />
                        </View>
                      )}
                    </View>
                    <Icon name="chevron-right" size={16} color={colors.mutedForeground} />
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>
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
  categoryScroll: {
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  lessonsContainer: {
    paddingHorizontal: 18,
    gap: 12,
  },
  lessonCard: {
    padding: 16,
    gap: 12,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  lessonMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  duration: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  lessonDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },
  progressBar: {
    marginTop: 4,
  },
  lessonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formats: {
    flexDirection: "row",
    gap: 6,
  },
  formatTag: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
