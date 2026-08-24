import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { SignBridgeVideo } from "@/components/SignBridgeVideo";
import { getLessonById, getNextLesson, Lesson } from "@/content/lessons";

export default function LessonDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, lessonProgress, updateLessonProgress, signBridgeEnabled } = useMwana();
  
  const lesson = getLessonById(id || "");
  const nextLesson = lesson ? getNextLesson(lesson.id) : undefined;
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  useEffect(() => {
    setStartTime(Date.now());
    
    // Check if lesson is already completed
    const existingProgress = lessonProgress.find((p) => p.lessonId === id);
    if (existingProgress?.completed) {
      setIsCompleted(true);
    }
  }, [id, lessonProgress]);
  
  const handleAnswer = (answerIndex: number) => {
    if (!lesson?.interactiveQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === lesson.interactiveQuestion.correctAnswer;
    
    if (isCorrect && !isCompleted) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      updateLessonProgress({
        lessonId: lesson.id,
        completed: true,
        lastAccessed: new Date(),
        timeSpent,
      });
      setIsCompleted(true);
    }
  };
  
  const handleComplete = () => {
    if (!lesson) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    updateLessonProgress({
      lessonId: lesson.id,
      completed: true,
      lastAccessed: new Date(),
      timeSpent,
    });
    setIsCompleted(true);
    
    Alert.alert(
      profile?.language === "fr" ? "Leçon complétée !" : "Lesson Completed!",
      profile?.language === "fr"
        ? "Félicitations ! Vous avez terminé cette leçon."
        : "Congratulations! You've completed this lesson.",
      [
        {
          text: profile?.language === "fr" ? "Retour" : "Back",
          onPress: () => router.back(),
        },
        nextLesson
          ? {
              text: profile?.language === "fr" ? "Leçon suivante" : "Next Lesson",
              onPress: () => router.push(`/lesson/${nextLesson.id}`),
            }
          : undefined,
      ].filter(Boolean) as any
    );
  };
  
  if (!lesson) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          {profile?.language === "fr" ? "Leçon non trouvée" : "Lesson not found"}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Badge variant="primary" size="sm">{lesson.category}</Badge>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {lesson.title}
            </Text>
            <Text style={[styles.headerMeta, { color: colors.mutedForeground }]}>
              {lesson.duration} min • {profile?.language === "fr" ? "Leçon" : "Lesson"} {lesson.order} of 8
            </Text>
          </View>
        </View>

        {/* SignBridge Toggle */}
        {signBridgeEnabled && (
          <Card style={styles.signbridgeCard} variant="outlined">
            <View style={styles.signbridgeContent}>
              <View style={[styles.signbridgeIcon, { backgroundColor: colors.care + "22" }]}>
                <Icon name="users" size={20} color={colors.care} />
              </View>
              <View style={styles.signbridgeInfo}>
                <Text style={[styles.signbridgeTitle, { color: colors.foreground }]}>
                  SignBridge Mode
                </Text>
                <Text style={[styles.signbridgeText, { color: colors.mutedForeground }]}>
                  {profile?.language === "fr"
                    ? "Version en langue des signes disponible"
                    : "Sign-language version available"}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* SignBridge Video */}
        {signBridgeEnabled && lesson.formats.signbridge && (
          <SignBridgeVideo lessonId={lesson.id} />
        )}

        {/* Lesson Content */}
        <Card style={styles.contentCard}>
          <Text style={[styles.contentText, { color: colors.foreground }]}>
            {lesson.content.text}
          </Text>
          
          {/* Key Points */}
          <View style={styles.keyPoints}>
            <Text style={[styles.keyPointsTitle, { color: colors.primary }]}>
              {profile?.language === "fr" ? "Points clés" : "Key Points"}
            </Text>
            {lesson.content.text.split("•").slice(1).map((point, index) => (
              <View key={index} style={styles.keyPoint}>
                <View style={[styles.keyPointBullet, { backgroundColor: colors.primary }]} />
                <Text style={[styles.keyPointText, { color: colors.foreground }]}>
                  {point.trim()}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Interactive Question */}
        {lesson.interactiveQuestion && (
          <Card style={styles.questionCard} variant="outlined">
            <View style={styles.questionHeader}>
              <View style={[styles.questionBadge, { backgroundColor: colors.accent + "22" }]}>
                <Icon name="help-circle" size={20} color={colors.accent} />
              </View>
              <Text style={[styles.questionTitle, { color: colors.foreground }]}>
                {profile?.language === "fr" ? "Question" : "Question"}
              </Text>
            </View>
            
            <Text style={[styles.questionText, { color: colors.foreground }]}>
              {lesson.interactiveQuestion.question}
            </Text>
            
            <View style={styles.optionsContainer}>
              {lesson.interactiveQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === lesson.interactiveQuestion?.correctAnswer;
                const isWrong = isSelected && !isCorrect;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !showFeedback && handleAnswer(index)}
                    disabled={showFeedback}
                    style={[
                      styles.option,
                      isSelected ? { backgroundColor: isCorrect ? colors.success + "22" : colors.destructive + "22", borderColor: isCorrect ? colors.success : colors.destructive } : { backgroundColor: colors.card, borderColor: colors.border },
                      showFeedback && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[styles.optionLetter, { backgroundColor: isSelected ? (isCorrect ? colors.success : colors.destructive) : colors.muted }]}>
                      <Text style={[styles.optionLetterText, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <Text style={[styles.optionText, { color: colors.foreground }]}>
                      {option}
                    </Text>
                    {showFeedback && isCorrect && (
                      <Icon name="check-circle" size={20} color={colors.success} />
                    )}
                    {showFeedback && isWrong && (
                      <Icon name="x-circle" size={20} color={colors.destructive} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {showFeedback && (
              <View style={[styles.feedbackBox, { backgroundColor: selectedAnswer === lesson.interactiveQuestion.correctAnswer ? colors.success + "22" : colors.warning + "22" }]}>
                <Icon
                  name={selectedAnswer === lesson.interactiveQuestion.correctAnswer ? "check-circle" : "info"}
                  size={20}
                  color={selectedAnswer === lesson.interactiveQuestion.correctAnswer ? colors.success : colors.warning}
                />
                <Text style={[styles.feedbackText, { color: colors.foreground }]}>
                  {lesson.interactiveQuestion.explanation}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Activity */}
        <Card style={styles.activityCard} variant="elevated">
          <View style={styles.activityHeader}>
            <View style={[styles.activityBadge, { backgroundColor: colors.warm + "22" }]}>
              <Icon name="clock" size={20} color={colors.warm} />
            </View>
            <View style={styles.activityHeaderContent}>
              <Text style={[styles.activityTitle, { color: colors.foreground }]}>
                {lesson.activity.title}
              </Text>
              <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>
                {lesson.activity.timeRequired} min
              </Text>
            </View>
          </View>
          
          <Text style={[styles.activityDescription, { color: colors.foreground }]}>
            {lesson.activity.description}
          </Text>
          
          <Button
            onPress={handleComplete}
            disabled={isCompleted}
            fullWidth
          >
            {isCompleted
              ? (profile?.language === "fr" ? "Marqué comme complété" : "Marked as Complete")
              : (profile?.language === "fr" ? "Marquer comme complété" : "Mark as Complete")}
          </Button>
        </Card>

        {/* Next Lesson */}
        {nextLesson && isCompleted && (
          <TouchableOpacity
            onPress={() => router.push(`/lesson/${nextLesson.id}`)}
            style={[styles.nextLessonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.nextLessonIcon, { backgroundColor: colors.primary + "22" }]}>
              <Icon name="arrow-right" size={20} color={colors.primary} />
            </View>
            <View style={styles.nextLessonInfo}>
              <Text style={[styles.nextLessonLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Leçon suivante" : "Next Lesson"}
              </Text>
              <Text style={[styles.nextLessonTitle, { color: colors.foreground }]}>
                {nextLesson.title}
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
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
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  headerMeta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  signbridgeCard: {
    marginHorizontal: 18,
    marginBottom: 16,
    padding: 14,
  },
  signbridgeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  signbridgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  signbridgeInfo: {
    flex: 1,
  },
  signbridgeTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  signbridgeText: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  contentCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
  },
  keyPoints: {
    gap: 12,
  },
  keyPointsTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  keyPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  keyPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  questionCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  questionBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  questionText: {
    fontSize: 15,
    marginBottom: 16,
    fontFamily: "Inter_500Medium",
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionLetterText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  activityCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  activityBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activityHeaderContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  nextLessonCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  nextLessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  nextLessonInfo: {
    flex: 1,
  },
  nextLessonLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  nextLessonTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});
