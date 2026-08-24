import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useMwana } from "@/context/MwanaContext";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";

type OnboardingStep = "welcome" | "language" | "children" | "learning" | "accessibility" | "complete";

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setProfile, updateSettings } = useMwana();
  
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedLanguage, setSelectedLanguage] =<"en" | "fr">("en");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedLearningFormat, setSelectedLearningFormat] = useState<"read" | "listen" | "sign" | "visual">("read");
  const [enableSignBridge, setEnableSignBridge] = useState(false);
  
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  
  const toggleAgeGroup = (group: string) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };
  
  const handleNext = () => {
    const steps: OnboardingStep[] = ["welcome", "language", "children", "learning", "accessibility", "complete"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };
  
  const handleComplete = () => {
    const profile = {
      id: Date.now().toString(),
      name: "Parent",
      language: selectedLanguage,
      childAgeGroups: selectedAgeGroups as any,
      learningFormat: selectedLearningFormat,
      accessibilityMode: enableSignBridge ? "signbridge" : "standard",
      onboardingCompleted: true,
      createdAt: new Date(),
    };
    
    setProfile(profile);
    updateSettings({ language: selectedLanguage });
    
    router.replace("/(tabs)");
  };
  
  const renderWelcome = () => (
    <View style={styles.content}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd, colors.background]}
        locations={[0, 0.6, 1]}
        style={[styles.hero, { paddingTop: topPad + 40 }]}
      >
        <View style={[styles.logoBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Icon name="heart" size={32} color="#fff" />
        </View>
        <Text style={[styles.heroTitle, { color: "#fff" }]}>MWANA CARE</Text>
        <Text style={[styles.heroTagline, { color: "rgba(255,255,255,0.85)" }]}>
          Nurturing Parents.{"\n"}Including Every Child.
        </Text>
      </LinearGradient>
      
      <View style={styles.body}>
        <Card style={styles.introCard}>
          <Text style={[styles.introTitle, { color: colors.foreground }]}>
            Welcome to Positive Parenting
          </Text>
          <Text style={[styles.introText, { color: colors.mutedForeground }]}>
            MWANA CARE helps you become the parent you want to be. Get practical, trusted support whenever and wherever you need it.
          </Text>
        </Card>
        
        <View style={styles.features}>
          {[
            { icon: "book-open", title: "Learn", desc: "Short, practical lessons" },
            { icon: "message-circle", title: "Coach", desc: "Personalized guidance" },
            { icon: "users", title: "Connect", desc: "Sign-language support" },
          ].map((feature) => (
            <View key={feature.title} style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + "22" }]}>
                <Icon name={feature.icon as any} size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
  
  const renderLanguage = () => (
    <View style={styles.content}>
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Choose Language</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select your preferred language
        </Text>
      </View>
      
      <View style={styles.body}>
        <TouchableOpacity
          onPress={() => setSelectedLanguage("en")}
          style={[
            styles.languageOption,
            selectedLanguage === "en" ? { backgroundColor: colors.primary + "22", borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.languageContent}>
            <Text style={[styles.languageName, { color: colors.foreground }]}>English</Text>
            <Text style={[styles.languageNative, { color: colors.mutedForeground }]}>🇬🇧 English</Text>
          </View>
          {selectedLanguage === "en" && <Icon name="check-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setSelectedLanguage("fr")}
          style={[
            styles.languageOption,
            selectedLanguage === "fr" ? { backgroundColor: colors.primary + "22", borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.languageContent}>
            <Text style={[styles.languageName, { color: colors.foreground }]}>Français</Text>
            <Text style={[styles.languageNative, { color: colors.mutedForeground }]}>🇫🇷 Français</Text>
          </View>
          {selectedLanguage === "fr" && <Icon name="check-circle" size={24} color={colors.primary} />}
        </TouchableOpacity>
        
        <Card style={styles.infoCard}>
          <Icon name="info" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            More languages coming soon, including Pidgin and local languages.
          </Text>
        </Card>
      </View>
    </View>
  );
  
  const renderChildren = () => (
    <View style={styles.content}>
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Who are you caring for?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Select all that apply
        </Text>
      </View>
      
      <View style={styles.body}>
        {[
          { id: "0-5", label: "0–5 years", icon: "smile" },
          { id: "6-12", label: "6–12 years", icon: "user" },
          { id: "13-17", label: "13–17 years", icon: "users" },
          { id: "multiple", label: "Multiple children", icon: "users" },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => toggleAgeGroup(option.id)}
            style={[
              styles.ageOption,
              selectedAgeGroups.includes(option.id) ? { backgroundColor: colors.primary + "22", borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.ageIcon, { backgroundColor: selectedAgeGroups.includes(option.id) ? colors.primary : colors.muted }]}>
              <Icon name={option.icon as any} size={20} color={selectedAgeGroups.includes(option.id) ? "#fff" : colors.primary} />
            </View>
            <Text style={[styles.ageLabel, { color: colors.foreground }]}>{option.label}</Text>
            {selectedAgeGroups.includes(option.id) && <Icon name="check" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  
  const renderLearning = () => (
    <View style={styles.content}>
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>How would you like to learn?</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Choose your preferred format
        </Text>
      </View>
      
      <View style={styles.body}>
        {[
          { id: "read", label: "Read", desc: "Text and illustrations", icon: "book-open" },
          { id: "listen", label: "Listen", desc: "Audio narration", icon: "volume-2" },
          { id: "visual", label: "Visual", desc: "Simple, visual content", icon: "eye" },
          { id: "sign", label: "Sign Language", desc: "SignBridge integration", icon: "users" },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => setSelectedLearningFormat(option.id as any)}
            style={[
              styles.learningOption,
              selectedLearningFormat === option.id ? { backgroundColor: colors.primary + "22", borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={[styles.learningIcon, { backgroundColor: selectedLearningFormat === option.id ? colors.primary : colors.muted }]}>
              <Icon name={option.icon as any} size={20} color={selectedLearningFormat === option.id ? "#fff" : colors.primary} />
            </View>
            <View style={styles.learningContent}>
              <Text style={[styles.learningLabel, { color: colors.foreground }]}>{option.label}</Text>
              <Text style={[styles.learningDesc, { color: colors.mutedForeground }]}>{option.desc}</Text>
            </View>
            {selectedLearningFormat === option.id && <Icon name="check" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
  
  const renderAccessibility = () => (
    <View style={styles.content}>
      <View style={[styles.header, { paddingTop: topPad + 20 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Accessibility</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Enable additional support
        </Text>
      </View>
      
      <View style={styles.body}>
        <TouchableOpacity
          onPress={() => setEnableSignBridge(!enableSignBridge)}
          style={[
            styles.accessOption,
            enableSignBridge ? { backgroundColor: colors.primary + "22", borderColor: colors.primary } : { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.accessIcon, { backgroundColor: enableSignBridge ? colors.primary : colors.muted }]}>
            <Icon name="users" size={24} color={enableSignBridge ? "#fff" : colors.primary} />
          </View>
          <View style={styles.accessContent}>
            <Text style={[styles.accessLabel, { color: colors.foreground }]}>SignBridge Mode</Text>
            <Text style={[styles.accessDesc, { color: colors.mutedForeground }]}>
              Sign-language support for deaf and hard-of-hearing families
            </Text>
          </View>
          <View style={[styles.toggle, { backgroundColor: enableSignBridge ? colors.primary : colors.muted }]}>
            <View style={[styles.toggleDot, { backgroundColor: "#fff", transform: [{ translateX: enableSignBridge ? 20 : 0 }] }]} />
          </View>
        </TouchableOpacity>
        
        <Card style={styles.infoCard}>
          <Icon name="info" size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            You can change these settings anytime in Settings.
          </Text>
        </Card>
      </View>
    </View>
  );
  
  const renderComplete = () => (
    <View style={styles.content}>
      <View style={[styles.header, { paddingTop: topPad + 40 }]}>
        <View style={[styles.completeIcon, { backgroundColor: colors.success + "22" }]}>
          <Icon name="check" size={40} color={colors.success} />
        </View>
        <Text style={[styles.completeTitle, { color: colors.foreground }]}>You're all set!</Text>
        <Text style={[styles.completeSubtitle, { color: colors.mutedForeground }]}>
          Your personalized parenting journey is ready
        </Text>
      </View>
      
      <View style={styles.body}>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Your Profile</Text>
          <View style={styles.summaryItem}>
            <Icon name="globe" size={16} color={colors.mutedForeground} />
            <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
              Language: {selectedLanguage === "en" ? "English" : "Français"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="users" size={16} color={colors.mutedForeground} />
            <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
              Children: {selectedAgeGroups.join(", ") || "Not specified"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Icon name="book-open" size={16} color={colors.mutedForeground} />
            <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
              Learning: {selectedLearningFormat}
            </Text>
          </View>
          {enableSignBridge && (
            <View style={styles.summaryItem}>
              <Icon name="users" size={16} color={colors.primary} />
              <Text style={[styles.summaryText, { color: colors.primary }]}>SignBridge enabled</Text>
            </View>
          )}
        </Card>
      </View>
    </View>
  );
  
  const canProceed = () => {
    switch (step) {
      case "welcome":
        return true;
      case "language":
        return true;
      case "children":
        return selectedAgeGroups.length > 0;
      case "learning":
        return true;
      case "accessibility":
        return true;
      case "complete":
        return true;
      default:
        return false;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {step === "welcome" && renderWelcome()}
        {step === "language" && renderLanguage()}
        {step === "children" && renderChildren()}
        {step === "learning" && renderLearning()}
        {step === "accessibility" && renderAccessibility()}
        {step === "complete" && renderComplete()}
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {step !== "welcome" && (
          <Button
            variant="ghost"
            onPress={() => {
              const steps: OnboardingStep[] = ["welcome", "language", "children", "learning", "accessibility", "complete"];
              const currentIndex = steps.indexOf(step);
              if (currentIndex > 0) {
                setStep(steps[currentIndex - 1]);
              }
            }}
            style={styles.backButton}
          >
            Back
          </Button>
        )}
        <Button
          onPress={step === "complete" ? handleComplete : handleNext}
          disabled={!canProceed()}
          fullWidth
          style={styles.nextButton}
        >
          {step === "complete" ? "Start Learning" : "Continue"}
        </Button>
      </View>
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
  content: {
    minHeight: "100%",
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Inter_500Medium",
  },
  body: {
    padding: 20,
    gap: 16,
  },
  introCard: {
    padding: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  features: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  featureDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  languageNative: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
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
  ageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  ageIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  ageLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  learningOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  learningIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  learningContent: {
    flex: 1,
  },
  learningLabel: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  learningDesc: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  accessOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  accessIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  accessContent: {
    flex: 1,
  },
  accessLabel: {
    fontSize: 17,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  accessDesc: {
    fontSize: 13,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 15,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  summaryCard: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
