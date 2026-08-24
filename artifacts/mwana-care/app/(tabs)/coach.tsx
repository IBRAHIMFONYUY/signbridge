import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";

interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedActivity?: string;
}

const QUICK_QUESTIONS = [
  "My child refuses to listen to me",
  "How do I handle tantrums?",
  "My child won't go to bed",
  "How can I encourage good behavior?",
  "My child is aggressive with others",
];

export default function CoachScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useMwana();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    // Simulate AI response (in production, this would call an AI API)
    setTimeout(() => {
      const aiResponse: CoachMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateMockResponse(input),
        timestamp: new Date(),
        suggestedActivity: "Try a 3-minute activity on positive communication",
      };
      
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };
  
  const generateMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("refuse") || lowerQuestion.includes("listen")) {
      return profile?.language === "fr"
        ? "Il semble que vous vivez une situation difficile. Au lieu de punir immédiatement, essayez d'abord de comprendre ce qui empêche votre enfant d'écouter. Vous pourriez demander : 'Qu'est-ce qui t'empêche de m'écouter en ce moment ?'"
        : "It sounds like you're experiencing a difficult situation. Instead of immediately punishing, try first to understand what's preventing your child from listening. You could ask: 'What's making it hard for you to listen right now?'";
    }
    
    if (lowerQuestion.includes("tantrum") || lowerQuestion.includes("cry")) {
      return profile?.language === "fr"
        ? "Les crises sont normales pour les enfants. Restez calme et aidez votre enfant à identifier ses émotions. Dites : 'Je vois que tu es contrarié. Parlons de ce qui se passe.'"
        : "Tantrums are normal for children. Stay calm and help your child identify their emotions. Say: 'I see you're upset. Let's talk about what's happening.'";
    }
    
    if (lowerQuestion.includes("bed") || lowerQuestion.includes("sleep")) {
      return profile?.language === "fr"
        ? "Les routines de coucher cohérentes aident les enfants à se sentir en sécurité. Créez une routine calme et expliquez pourquoi le sommeil est important pour leur croissance."
        : "Consistent bedtime routines help children feel secure. Create a calm routine and explain why sleep is important for their growth.";
    }
    
    if (lowerQuestion.includes("encourage") || lowerQuestion.includes("good behavior")) {
      return profile?.language === "fr"
        ? "Le renforcement positif est très efficace. Félicitez spécifiquement les comportements que vous voulez voir. Dites : 'J'ai remarqué comment tu as partagé ton jouet. C'était très gentil.'"
        : "Positive reinforcement is very effective. Praise specific behaviors you want to see. Say: 'I noticed how you shared your toy. That was very kind.'";
    }
    
    if (lowerQuestion.includes("aggressive") || lowerQuestion.includes("hit") || lowerQuestion.includes("fight")) {
      return profile?.language === "fr"
        ? "L'agressivité peut signaler que votre enfant a du mal à gérer ses émotions. Apprenez-leur à exprimer leurs sentiments avec des mots et donnez l'exemple en restant calme vous-même."
        : "Aggression can signal that your child is struggling to manage emotions. Teach them to express feelings with words and model calm behavior yourself.";
    }
    
    return profile?.language === "fr"
      ? "C'est une excellente question. La parentalité positive se concentre sur l'enseignement plutôt que la punition. Essayez de comprendre le besoin derrière le comportement de votre enfant."
      : "That's a great question. Positive parenting focuses on teaching rather than punishment. Try to understand the need behind your child's behavior.";
  };
  
  const handleQuickQuestion = (question: string) => {
    setInput(question);
    handleSend();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          MWANA Coach
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {profile?.language === "fr" 
            ? "Conseils personnalisés basés sur des programmes validés"
            : "Personalized guidance based on validated programs"}
        </Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accent + "22" }]}>
              <Icon name="message-circle" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {profile?.language === "fr" ? "Besoin d'aide ?" : "Need help?"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {profile?.language === "fr"
                ? "Posez une question sur une situation de parentalité réelle et recevez des conseils basés sur des programmes validés."
                : "Ask a question about a real parenting situation and get guidance based on validated programs."}
            </Text>
            
            <View style={styles.quickQuestions}>
              <Text style={[styles.quickQuestionsTitle, { color: colors.foreground }]}>
                {profile?.language === "fr" ? "Questions rapides :" : "Quick questions:"}
              </Text>
              {QUICK_QUESTIONS.map((question) => (
                <TouchableOpacity
                  key={question}
                  onPress={() => handleQuickQuestion(question)}
                  style={[styles.quickQuestionChip, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Text style={[styles.quickQuestionText, { color: colors.foreground }]}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.role === "user" ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Card
                  style={[
                    styles.messageCard,
                    message.role === "user"
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  variant={message.role === "assistant" ? "outlined" : "default"}
                >
                  {message.role === "assistant" && (
                    <View style={styles.assistantHeader}>
                      <View style={[styles.assistantBadge, { backgroundColor: colors.accent + "22" }]}>
                        <Icon name="zap" size={12} color={colors.accent} />
                      </View>
                      <Badge variant="default" size="sm">MWANA Coach</Badge>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      { color: message.role === "user" ? "#fff" : colors.foreground },
                    ]}
                  >
                    {message.content}
                  </Text>
                  {message.suggestedActivity && (
                    <TouchableOpacity style={[styles.activitySuggestion, { backgroundColor: colors.success + "22" }]}>
                      <Icon name="check-circle" size={16} color={colors.success} />
                      <Text style={[styles.activityText, { color: colors.success }]}>
                        {message.suggestedActivity}
                      </Text>
                    </TouchableOpacity>
                  )}
                </Card>
              </View>
            ))}
            {isLoading && (
              <View style={styles.messageWrapper}>
                <Card style={[styles.messageCard, styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.border }]} variant="outlined">
                  <View style={styles.loadingDots}>
                    <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
                    <View style={[styles.loadingDot, { backgroundColor: colors.primary }]} />
                  </View>
                </Card>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Card style={styles.inputCard} variant="outlined">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              profile?.language === "fr"
                ? "Décrivez votre situation..."
                : "Describe your situation..."
            }
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground }]}
            multiline
            maxLength={500}
          />
          <Button
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            style={styles.sendButton}
          >
            <Icon name="send" size={18} color="#fff" />
          </Button>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 32,
  },
  quickQuestions: {
    width: "100%",
    gap: 10,
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 12,
  },
  quickQuestionChip: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickQuestionText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  messagesList: {
    gap: 12,
    paddingTop: 20,
  },
  messageWrapper: {
    flexDirection: "row",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  assistantMessage: {
    justifyContent: "flex-start",
  },
  messageCard: {
    maxWidth: "85%",
    padding: 16,
    gap: 8,
  },
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  assistantBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
  activitySuggestion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  activityText: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  loadingCard: {
    padding: 20,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  inputCard: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
