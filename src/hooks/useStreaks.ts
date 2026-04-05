import { db } from "../db/database";
import type { Streak, StreakType } from "../types";
import { getStartOfDay, getEndOfDay, isSameDay } from "../utils/time";

export async function getStreak(type: StreakType): Promise<Streak | undefined> {
  return db.streaks.where("type").equals(type).first();
}

export async function evaluateFastingStreak(completedAt: Date): Promise<void> {
  const today = getStartOfDay(completedAt);
  const todayEnd = getEndOfDay(completedAt);
  const todayFasts = await db.fastingSessions
    .where("startTime").between(new Date(today.getTime() - 24 * 60 * 60 * 1000), todayEnd, true, true)
    .filter((s) => {
      if (s.status !== "completed" || !s.endTime) return false;
      const duration = s.endTime.getTime() - s.startTime.getTime();
      return duration >= s.targetDurationMs && s.targetDurationMs > 0;
    }).toArray();
  if (todayFasts.length === 0) return;
  await updateStreak("fasting", completedAt);
}

export async function evaluateHydrationStreak(date: Date): Promise<void> {
  const profile = await db.userProfile.toCollection().first();
  if (!profile) return;
  const dayStart = getStartOfDay(date);
  const dayEnd = getEndOfDay(date);
  const entries = await db.hydrationEntries.where("timestamp").between(dayStart, dayEnd, true, true).toArray();
  const total = entries.reduce((sum, e) => sum + e.amountMl, 0);
  if (total < profile.dailyWaterGoalMl) return;
  await updateStreak("hydration", date);
}

async function updateStreak(type: StreakType, date: Date): Promise<void> {
  const existing = await getStreak(type);
  const today = getStartOfDay(date);
  if (!existing) {
    await db.streaks.add({ type, currentCount: 1, longestCount: 1, lastCompletedDate: today });
    return;
  }
  if (isSameDay(existing.lastCompletedDate, today)) return;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isConsecutive = isSameDay(existing.lastCompletedDate, yesterday);
  const newCount = isConsecutive ? existing.currentCount + 1 : 1;
  const newLongest = Math.max(newCount, existing.longestCount);
  await db.streaks.where("type").equals(type).modify({ currentCount: newCount, longestCount: newLongest, lastCompletedDate: today });
}
