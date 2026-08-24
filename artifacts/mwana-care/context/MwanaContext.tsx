import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  sendCompletionCheck,
  sendStreakReminder,
} from "@/utils/notifications";

export interface UserProfile {
  id: string;
  name: string;
  language: "en" | "fr";
  childAgeGroups: ("0-5" | "6-12" | "13-17" | "multiple")[];
  learningFormat: "read" | "listen" | "sign" | "visual";
  accessibilityMode: "standard" | "signbridge" | "low-literacy" | "visual";
  onboardingCompleted: boolean;
  createdAt: Date;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastAccessed: Date;
  timeSpent: number; // in seconds
}

export interface PracticeProgress {
  scenarioId: string;
  completed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  lastAttempted: Date;
}

export interface AppSettings {
  largeText: boolean;
  highContrast: boolean;
  darkMode: boolean;
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:MM format
  language: "en" | "fr";
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
}

interface MwanaContextValue {
  // User profile
  profile: UserProfile | null;
  setProfile: (p: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  
  // Progress
  lessonProgress: LessonProgress[];
  updateLessonProgress: (progress: LessonProgress) => void;
  practiceProgress: PracticeProgress[];
  updatePracticeProgress: (progress: PracticeProgress) => void;
  
  // Streak
  streak: StreakData;
  updateStreak: () => void;
  
  // SignBridge integration
  signBridgeEnabled: boolean;
  setSignBridgeEnabled: (enabled: boolean) => void;
  
  // Notifications
  requestNotificationPermissions: () => Promise<boolean>;
  scheduleDailyReminder: (title: string, body: string) => Promise<void>;
  cancelDailyReminder: () => Promise<void>;
  sendCompletionCheck: (lessonTitle: string) => Promise<void>;
  sendStreakReminder: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  largeText: false,
  highContrast: false,
  darkMode: true,
  notificationsEnabled: true,
  dailyReminderTime: "09:00",
  language: "en",
};

const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
};

const MwanaContext = createContext<MwanaContextValue>({} as MwanaContextValue);

export function MwanaProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress[]>([]);
  const [streak, setStreak] = useState<StreakData>(defaultStreak);
  const [signBridgeEnabled, setSignBridgeEnabled] = useState(false);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem("mwana_profile").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as UserProfile;
          setProfileState({ ...parsed, createdAt: new Date(parsed.createdAt) });
        } catch {}
      }
    });
    
    AsyncStorage.getItem("mwana_settings").then((val) => {
      if (val) {
        try {
          setSettings(JSON.parse(val));
        } catch {}
      }
    });
    
    AsyncStorage.getItem("mwana_lesson_progress").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as LessonProgress[];
          setLessonProgress(
            parsed.map((p) => ({ ...p, lastAccessed: new Date(p.lastAccessed) }))
          );
        } catch {}
      }
    });
    
    AsyncStorage.getItem("mwana_practice_progress").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as PracticeProgress[];
          setPracticeProgress(
            parsed.map((p) => ({ ...p, lastAttempted: new Date(p.lastAttempted) }))
          );
        } catch {}
      }
    });
    
    AsyncStorage.getItem("mwana_streak").then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val) as StreakData;
          setStreak({
            ...parsed,
            lastActiveDate: parsed.lastActiveDate ? new Date(parsed.lastActiveDate) : null,
          });
        } catch {}
      }
    });
    
    AsyncStorage.getItem("mwana_signbridge").then((val) => {
      if (val) {
        try {
          setSignBridgeEnabled(JSON.parse(val));
        } catch {}
      }
    });
  }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    AsyncStorage.setItem("mwana_profile", JSON.stringify(p));
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      AsyncStorage.setItem("mwana_profile", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      AsyncStorage.setItem("mwana_settings", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateLessonProgress = useCallback((progress: LessonProgress) => {
    setLessonProgress((prev) => {
      const existingIndex = prev.findIndex((p) => p.lessonId === progress.lessonId);
      let next;
      if (existingIndex >= 0) {
        next = [...prev];
        next[existingIndex] = progress;
      } else {
        next = [...prev, progress];
      }
      AsyncStorage.setItem("mwana_lesson_progress", JSON.stringify(next));
      return next;
    });
  }, []);

  const updatePracticeProgress = useCallback((progress: PracticeProgress) => {
    setPracticeProgress((prev) => {
      const existingIndex = prev.findIndex((p) => p.scenarioId === progress.scenarioId);
      let next;
      if (existingIndex >= 0) {
        next = [...prev];
        next[existingIndex] = progress;
      } else {
        next = [...prev, progress];
      }
      AsyncStorage.setItem("mwana_practice_progress", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    setStreak((prev) => {
      if (!prev.lastActiveDate) {
        const next = { ...prev, currentStreak: 1, longestStreak: 1, lastActiveDate: today };
        AsyncStorage.setItem("mwana_streak", JSON.stringify(next));
        return next;
      }
      
      const lastActive = new Date(prev.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      let next;
      if (diffDays === 0) {
        // Same day, no change
        next = prev;
      } else if (diffDays === 1) {
        // Consecutive day
        const newStreak = prev.currentStreak + 1;
        next = {
          ...prev,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          lastActiveDate: today,
        };
      } else {
        // Streak broken
        next = { ...prev, currentStreak: 1, lastActiveDate: today };
      }
      
      AsyncStorage.setItem("mwana_streak", JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSetSignBridgeEnabled = useCallback((enabled: boolean) => {
    setSignBridgeEnabled(enabled);
    AsyncStorage.setItem("mwana_signbridge", JSON.stringify(enabled));
  }, []);

  // Notification functions
  const handleRequestNotificationPermissions = useCallback(async () => {
    return await requestNotificationPermissions();
  }, []);

  const handleScheduleDailyReminder = useCallback(async (title: string, body: string) => {
    const [hour, minute] = settings.dailyReminderTime.split(":").map(Number);
    await scheduleDailyReminder(title, body, { hour, minute });
  }, [settings.dailyReminderTime]);

  const handleCancelDailyReminder = useCallback(async () => {
    await cancelDailyReminder();
  }, []);

  const handleSendCompletionCheck = useCallback(async (lessonTitle: string) => {
    if (!settings.notificationsEnabled) return;
    await sendCompletionCheck(lessonTitle, profile?.language || "en");
  }, [settings.notificationsEnabled, profile?.language]);

  const handleSendStreakReminder = useCallback(async () => {
    if (!settings.notificationsEnabled) return;
    await sendStreakReminder(streak.currentStreak, profile?.language || "en");
  }, [settings.notificationsEnabled, streak.currentStreak, profile?.language]);

  // Request permissions on mount if notifications are enabled
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermissions();
    }
  }, [settings.notificationsEnabled]);

  return (
    <MwanaContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        settings,
        updateSettings,
        lessonProgress,
        updateLessonProgress,
        practiceProgress,
        updatePracticeProgress,
        streak,
        updateStreak,
        signBridgeEnabled,
        setSignBridgeEnabled: handleSetSignBridgeEnabled,
        requestNotificationPermissions: handleRequestNotificationPermissions,
        scheduleDailyReminder: handleScheduleDailyReminder,
        cancelDailyReminder: handleCancelDailyReminder,
        sendCompletionCheck: handleSendCompletionCheck,
        sendStreakReminder: handleSendStreakReminder,
      }}
    >
      {children}
    </MwanaContext.Provider>
  );
}

export function useMwana() {
  return useContext(MwanaContext);
}
