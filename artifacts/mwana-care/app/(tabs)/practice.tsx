import React, { useState } from "react";
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
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";

interface Scenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "broken-cup",
    title: "Broken Cup",
    description: "Your child accidentally breaks a cup while playing",
    category: "discipline",
    difficulty: "easy",
    question: "What is the best response?",
    options: [
      "Shout at them and send them to their room",
      "Hit them so they learn to be careful",
      "Stay calm, help them clean it up, and discuss how to be careful",
      "Ignore it and clean it up yourself",
    ],
    correctAnswer: 2,
    explanation: "Staying calm and involving your child in cleaning up teaches responsibility without fear or shame. This builds trust and helps them learn from mistakes.",
  },
  {
    id: "refuses-homework",
    title: "Homework Refusal",
    description: "Your child refuses to do their homework",
    category: "communication",
    difficulty: "medium",
    question: "What should you do first?",
    options: [
      "Force them to sit down until it's done",
      "Take away their privileges",
      "Ask them why they don't want to do it and listen to their reasons",
      "Do it for them so it's over",
    ],
    correctAnswer: 2,
    explanation: "Understanding why your child is resisting helps you address the root cause. They might be struggling, tired, or need help with the material.",
  },
  {
    id: "tantrum-public",
    title: "Public Tantrum",
    description: "Your child has a tantrum in a public place",
    category: "emotions",
    difficulty: "hard",
    question: "How should you respond?",
    options: [
      "Give in to stop the embarrassment",
      "Shame them for their behavior",
      "Stay calm, move to a quieter place if possible, and wait for them to calm down",
      "Punish them when you get home",
    ],
    correctAnswer: 2,
    explanation: "Staying calm models emotional regulation for your child. Moving to a quieter space reduces stimulation and helps them regain control faster.",
  },
  {
    id: "wont-share",
    title: "Sharing Toys",
    description: "Your child refuses to share toys with a sibling",
    category: "discipline",
    difficulty: "easy",
    question: "What approach works best?",
    options: [
      "Force them to share immediately",
      "Take the toy away from both children",
      "Encourage turn-taking and explain how sharing feels good",
      "Buy another toy to avoid conflict",
    ],
    correctAnswer: 2,
    explanation: "Teaching turn-taking and empathy helps children understand sharing. Forced sharing can create resentment while explanation builds understanding.",
  },
  {
    id: "bedtime-refusal",
    title: "Bedtime Struggle",
    description: "Your child refuses to go to bed",
    category: "communication",
    difficulty: "medium",
    question: "What's a positive approach?",
    options: [
      "Physically force them to bed",
      "Give up and let them stay up",
      "Create a consistent bedtime routine and explain why sleep is important",
      "Threaten punishment if they don't sleep",
    ],
    correctAnswer: 2,
    explanation: "Consistent routines help children feel secure and know what to expect. Explaining the importance of sleep helps them understand why bedtime matters.",
  },
];

export default function PracticeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, practiceProgress } = useMwana();
  
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    // Update progress
    const isCorrect = answerIndex === selectedScenario?.correctAnswer;
    const existingProgress = practiceProgress.find((p) => p.scenarioId === selectedScenario?.id);
    
    if (selectedScenario) {
      const newProgress = {
        scenarioId: selectedScenario.id,
        completed: isCorrect,
        correctAnswers: isCorrect ? 1 : 0,
        totalQuestions: 1,
        lastAttempted: new Date(),
      };
      
      // This would update the context in a real implementation
    }
  };
  
  const resetScenario = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
  };
  
  const getDifficultyColor = (difficulty: Scenario["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return colors.success;
      case "medium":
        return colors.warning;
      case "hard":
        return colors.destructive;
      default:
        return colors.mutedForeground;
    }
  };
  
  const getCompletedCount = () => {
    return practiceProgress.filter((p) => p.completed).length;
  };

  if (selectedScenario) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { setSelectedScenario(null); resetScenario(); }}>
              <Icon name="arrow-left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              {profile?.language === "fr" ? "Pratique" : "Practice"}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          
          <Card style={styles.scenarioCard}>
            <View style={styles.scenarioHeader}>
              <Badge variant="primary">{selectedScenario.category}</Badge>
              <Badge variant={selectedScenario.difficulty === "easy" ? "success" : selectedScenario.difficulty === "medium" ? "warning" : "destructive"}>
                {selectedScenario.difficulty}
              </Badge>
            </View>
            
            <Text style={[styles.scenarioTitle, { color: colors.foreground }]}>
              {selectedScenario.title}
            </Text>
            <Text style={[styles.scenarioDescription, { color: colors.mutedForeground }]}>
              {selectedScenario.description}
            </Text>
            
            <View style={styles.questionBox}>
              <Text style={[styles.questionLabel, { color: colors.primary }]}>
                {profile?.language === "fr" ? "Question" : "Question"}
              </Text>
              <Text style={[styles.questionText, { color: colors.foreground }]}>
                {selectedScenario.question}
              </Text>
            </View>
            
            <View style={styles.optionsContainer}>
              {selectedScenario.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === selectedScenario.correctAnswer;
                const isWrong = isSelected && !isCorrect;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => !showExplanation && handleAnswer(index)}
                    disabled={showExplanation}
                    style={[
                      styles.option,
                      isSelected ? { backgroundColor: isCorrect ? colors.success + "22" : colors.destructive + "22", borderColor: isCorrect ? colors.success : colors.destructive } : { backgroundColor: colors.card, borderColor: colors.border },
                      showExplanation && { opacity: 0.7 },
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
                    {showExplanation && isCorrect && (
                      <Icon name="check-circle" size={20} color={colors.success} />
                    )}
                    {showExplanation && isWrong && (
                      <Icon name="x-circle" size={20} color={colors.destructive} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {showExplanation && (
              <View style={[styles.explanationBox, { backgroundColor: colors.accent + "22" }]}>
                <View style={styles.explanationHeader}>
                  <Icon name="info" size={20} color={colors.accent} />
                  <Text style={[styles.explanationTitle, { color: colors.accent }]}>
                    {selectedAnswer === selectedScenario.correctAnswer 
                      ? (profile?.language === "fr" ? "Correct !" : "Correct!")
                      : (profile?.language === "fr" ? "Incorrect" : "Incorrect")}
                  </Text>
                </View>
                <Text style={[styles.explanationText, { color: colors.foreground }]}>
                  {selectedScenario.explanation}
                </Text>
              </View>
            )}
            
            {showExplanation && (
              <Button onPress={() => { setSelectedScenario(null); resetScenario(); }} fullWidth>
                {profile?.language === "fr" ? "Retour aux scénarios" : "Back to Scenarios"}
              </Button>
            )}
          </Card>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            MWANA Practice
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {profile?.language === "fr" 
              ? "Scénarios de parentalité réelle"
              : "Real-life parenting scenarios"}
          </Text>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {getCompletedCount()}/{SCENARIOS.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Complétés" : "Completed"}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {practiceProgress.length > 0 
                  ? Math.round((practiceProgress.reduce((acc, p) => acc + p.correctAnswers, 0) / practiceProgress.length) * 100)
                  : 0}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {profile?.language === "fr" ? "Précision" : "Accuracy"}
              </Text>
            </View>
          </View>
        </Card>

        {/* Scenarios List */}
        <View style={styles.scenariosContainer}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {profile?.language === "fr" ? "Scénarios" : "Scenarios"}
          </Text>
          
          {SCENARIOS.map((scenario) => {
            const completed = practiceProgress.find((p) => p.scenarioId === scenario.id)?.completed;
            
            return (
              <TouchableOpacity
                key={scenario.id}
                onPress={() => setSelectedScenario(scenario)}
                activeOpacity={0.7}
              >
                <Card style={styles.scenarioCard} variant="outlined">
                  <View style={styles.scenarioRow}>
                    <View style={[styles.scenarioIcon, { backgroundColor: getDifficultyColor(scenario.difficulty) + "22" }]}>
                      <Icon name="target" size={20} color={getDifficultyColor(scenario.difficulty)} />
                    </View>
                    <View style={styles.scenarioInfo}>
                      <Text style={[styles.scenarioTitle, { color: colors.foreground }]}>
                        {scenario.title}
                      </Text>
                      <Text style={[styles.scenarioDesc, { color: colors.mutedForeground }]}>
                        {scenario.description}
                      </Text>
                      <View style={styles.scenarioMeta}>
                        <Badge variant="default" size="sm">{scenario.category}</Badge>
                        <Badge variant={scenario.difficulty === "easy" ? "success" : scenario.difficulty === "medium" ? "warning" : "destructive"} size="sm">
                          {scenario.difficulty}
                        </Badge>
                      </View>
                    </View>
                    {completed && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success + "22" }]}>
                        <Icon name="check" size={16} color={colors.success} />
                      </View>
                    )}
                    <Icon name="chevron-right" size={20} color={colors.mutedForeground} />
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  statsCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  scenariosContainer: {
    paddingHorizontal: 18,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  scenarioCard: {
    padding: 16,
    gap: 12,
  },
  scenarioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scenarioIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  scenarioDesc: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  scenarioMeta: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  scenarioHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  questionBox: {
    backgroundColor: "rgba(37, 99, 235, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
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
  explanationBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
});
