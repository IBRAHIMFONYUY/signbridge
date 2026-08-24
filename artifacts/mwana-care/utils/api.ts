// API client for MWANA CARE backend integration
// This provides a typed interface to the backend API

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

interface UserProfile {
  id: string;
  name: string;
  language: "en" | "fr";
  childAgeGroups: ("0-5" | "6-12" | "13-17" | "multiple")[];
  learningFormat: "read" | "listen" | "sign" | "visual";
  accessibilityMode: "standard" | "signbridge" | "low-literacy" | "visual";
  onboardingCompleted: boolean;
  createdAt: string;
}

interface LessonProgress {
  lessonId: string;
  completed: boolean;
  lastAccessed: string;
  timeSpent: number;
}

interface PracticeProgress {
  scenarioId: string;
  completed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  lastAttempted: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Profile endpoints
  async getProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/mwana/profile/${userId}`);
  }

  async createProfile(profile: UserProfile): Promise<UserProfile> {
    return this.request<UserProfile>("/mwana/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/mwana/profile/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Lesson progress endpoints
  async getLessonProgress(userId: string): Promise<LessonProgress[]> {
    return this.request<LessonProgress[]>(`/mwana/progress/lessons/${userId}`);
  }

  async updateLessonProgress(userId: string, progress: LessonProgress): Promise<LessonProgress> {
    return this.request<LessonProgress>(`/mwana/progress/lessons/${userId}`, {
      method: "POST",
      body: JSON.stringify(progress),
    });
  }

  // Practice progress endpoints
  async getPracticeProgress(userId: string): Promise<PracticeProgress[]> {
    return this.request<PracticeProgress[]>(`/mwana/progress/practice/${userId}`);
  }

  async updatePracticeProgress(userId: string, progress: PracticeProgress): Promise<PracticeProgress> {
    return this.request<PracticeProgress>(`/mwana/progress/practice/${userId}`, {
      method: "POST",
      body: JSON.stringify(progress),
    });
  }

  // Streak endpoints
  async getStreak(userId: string): Promise<StreakData> {
    return this.request<StreakData>(`/mwana/streak/${userId}`);
  }

  async updateStreak(userId: string, streak: StreakData): Promise<StreakData> {
    return this.request<StreakData>(`/mwana/streak/${userId}`, {
      method: "POST",
      body: JSON.stringify(streak),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  UserProfile,
  LessonProgress,
  PracticeProgress,
  StreakData,
};
