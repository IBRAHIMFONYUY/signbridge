import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

// Validation schemas
const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.enum(["en", "fr"]),
  childAgeGroups: z.array(z.enum(["0-5", "6-12", "13-17", "multiple"])),
  learningFormat: z.enum(["read", "listen", "sign", "visual"]),
  accessibilityMode: z.enum(["standard", "signbridge", "low-literacy", "visual"]),
  onboardingCompleted: z.boolean(),
  createdAt: z.string(),
});

const LessonProgressSchema = z.object({
  lessonId: z.string(),
  completed: z.boolean(),
  lastAccessed: z.string(),
  timeSpent: z.number(),
});

const PracticeProgressSchema = z.object({
  scenarioId: z.string(),
  completed: z.boolean(),
  correctAnswers: z.number(),
  totalQuestions: z.number(),
  lastAttempted: z.string(),
});

const StreakDataSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastActiveDate: z.string().nullable(),
});

// In-memory storage (replace with database in production)
const userProfiles = new Map<string, z.infer<typeof UserProfileSchema>>();
const lessonProgressData = new Map<string, z.infer<typeof LessonProgressSchema>[]>();
const practiceProgressData = new Map<string, z.infer<typeof PracticeProgressSchema>[]>();
const streakData = new Map<string, z.infer<typeof StreakDataSchema>>();

// GET /api/mwana/profile/:userId
router.get("/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const profile = userProfiles.get(userId);
  
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }
  
  res.json(profile);
});

// POST /api/mwana/profile
router.post("/profile", (req, res) => {
  try {
    const profile = UserProfileSchema.parse(req.body);
    userProfiles.set(profile.id, profile);
    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ error: "Invalid profile data" });
  }
});

// PUT /api/mwana/profile/:userId
router.put("/profile/:userId", (req, res) => {
  const { userId } = req.params;
  const existing = userProfiles.get(userId);
  
  if (!existing) {
    return res.status(404).json({ error: "Profile not found" });
  }
  
  try {
    const updates = UserProfileSchema.partial().parse(req.body);
    const updated = { ...existing, ...updates };
    userProfiles.set(userId, updated);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Invalid profile data" });
  }
});

// GET /api/mwana/progress/lessons/:userId
router.get("/progress/lessons/:userId", (req, res) => {
  const { userId } = req.params;
  const progress = lessonProgressData.get(userId) || [];
  res.json(progress);
});

// POST /api/mwana/progress/lessons/:userId
router.post("/progress/lessons/:userId", (req, res) => {
  const { userId } = req.params;
  
  try {
    const progress = LessonProgressSchema.parse(req.body);
    const userProgress = lessonProgressData.get(userId) || [];
    
    const existingIndex = userProgress.findIndex((p) => p.lessonId === progress.lessonId);
    let updated;
    
    if (existingIndex >= 0) {
      updated = [...userProgress];
      updated[existingIndex] = progress;
    } else {
      updated = [...userProgress, progress];
    }
    
    lessonProgressData.set(userId, updated);
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ error: "Invalid progress data" });
  }
});

// GET /api/mwana/progress/practice/:userId
router.get("/progress/practice/:userId", (req, res) => {
  const { userId } = req.params;
  const progress = practiceProgressData.get(userId) || [];
  res.json(progress);
});

// POST /api/mwana/progress/practice/:userId
router.post("/progress/practice/:userId", (req, res) => {
  const { userId } = req.params;
  
  try {
    const progress = PracticeProgressSchema.parse(req.body);
    const userProgress = practiceProgressData.get(userId) || [];
    
    const existingIndex = userProgress.findIndex((p) => p.scenarioId === progress.scenarioId);
    let updated;
    
    if (existingIndex >= 0) {
      updated = [...userProgress];
      updated[existingIndex] = progress;
    } else {
      updated = [...userProgress, progress];
    }
    
    practiceProgressData.set(userId, updated);
    res.status(201).json(progress);
  } catch (error) {
    res.status(400).json({ error: "Invalid progress data" });
  }
});

// GET /api/mwana/streak/:userId
router.get("/streak/:userId", (req, res) => {
  const { userId } = req.params;
  const streak = streakData.get(userId) || {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  };
  res.json(streak);
});

// POST /api/mwana/streak/:userId
router.post("/streak/:userId", (req, res) => {
  const { userId } = req.params;
  
  try {
    const streak = StreakDataSchema.parse(req.body);
    streakData.set(userId, streak);
    res.status(201).json(streak);
  } catch (error) {
    res.status(400).json({ error: "Invalid streak data" });
  }
});

export default router;
