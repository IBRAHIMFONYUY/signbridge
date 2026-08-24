import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSchedule {
  hour: number;
  minute: number;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === "granted") {
    return true;
  }
  
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/**
 * Schedule a daily reminder notification
 */
export async function scheduleDailyReminder(
  title: string,
  body: string,
  schedule: NotificationSchedule
): Promise<string> {
  const { status } = await Notifications.getPermissionsAsync();
  
  if (status !== "granted") {
    throw new Error("Notification permissions not granted");
  }
  
  // Cancel any existing daily reminders
  await cancelDailyReminder();
  
  const trigger = Notifications.ScheduleIntervalTriggerInput;
  
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: schedule.hour,
      minute: schedule.minute,
      repeats: true,
    },
  });
  
  return id;
}

/**
 * Cancel daily reminder notification
 */
export async function cancelDailyReminder(): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}

/**
 * Send a completion check notification
 */
export async function sendCompletionCheck(
  lessonTitle: string,
  language: "en" | "fr" = "en"
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  
  if (status !== "granted") {
    return;
  }
  
  const title = language === "fr" 
    ? "Avez-vous terminé votre leçon ?"
    : "Did you complete your lesson?";
  
  const body = language === "fr"
    ? `Prenez 5 minutes pour "${lessonTitle}"`
    : `Take 5 minutes for "${lessonTitle}"`;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { type: "completion_check", lessonTitle },
    },
    trigger: null, // Show immediately
  });
}

/**
 * Send a streak reminder notification
 */
export async function sendStreakReminder(
  currentStreak: number,
  language: "en" | "fr" = "en"
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  
  if (status !== "granted") {
    return;
  }
  
  const title = language === "fr"
    ? "Continuez votre série !"
    : "Keep your streak going!";
  
  const body = language === "fr"
    ? `Vous êtes sur une série de ${currentStreak} jours. Continuez !`
    : `You're on a ${currentStreak} day streak. Keep it up!`;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { type: "streak_reminder", currentStreak },
    },
    trigger: null,
  });
}

/**
 * Send a new lesson available notification
 */
export async function sendNewLessonNotification(
  lessonTitle: string,
  language: "en" | "fr" = "en"
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  
  if (status !== "granted") {
    return;
  }
  
  const title = language === "fr"
    ? "Nouvelle leçon disponible"
    : "New lesson available";
  
  const body = language === "fr"
    ? `Découvrez "${lessonTitle}"`
    : `Discover "${lessonTitle}"`;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { type: "new_lesson", lessonTitle },
    },
    trigger: null,
  });
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void
): { remove: () => void } {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): { remove: () => void } {
  return Notifications.addNotificationReceivedListener(listener);
}

/**
 * Get notification settings
 */
export async function getNotificationSettings(): Promise<Notifications.NotificationPermissionsStatus> {
  return await Notifications.getPermissionsAsync();
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}
