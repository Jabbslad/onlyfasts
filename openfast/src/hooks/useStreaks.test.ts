import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/database";
import { evaluateFastingStreak, evaluateHydrationStreak, getStreak } from "./useStreaks";

beforeEach(async () => { await db.delete(); await db.open(); });

describe("evaluateFastingStreak", () => {
  it("starts a streak on first completed fast that meets target", async () => {
    const now = new Date(2026, 3, 4, 14, 0);
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 3, 20, 0), endTime: now, protocol: "16:8", targetDurationMs: 16 * 60 * 60 * 1000, status: "completed" });
    await evaluateFastingStreak(now);
    const streak = await getStreak("fasting");
    expect(streak).toBeDefined();
    expect(streak!.currentCount).toBe(1);
  });

  it("increments streak for consecutive days", async () => {
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 3, 20, 0), endTime: new Date(2026, 3, 4, 12, 0), protocol: "16:8", targetDurationMs: 16 * 60 * 60 * 1000, status: "completed" });
    await evaluateFastingStreak(new Date(2026, 3, 4, 12, 0));
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 4, 20, 0), endTime: new Date(2026, 3, 5, 12, 0), protocol: "16:8", targetDurationMs: 16 * 60 * 60 * 1000, status: "completed" });
    await evaluateFastingStreak(new Date(2026, 3, 5, 12, 0));
    const streak = await getStreak("fasting");
    expect(streak!.currentCount).toBe(2);
    expect(streak!.longestCount).toBe(2);
  });

  it("does not increment for a fast shorter than target", async () => {
    await db.fastingSessions.add({ startTime: new Date(2026, 3, 4, 6, 0), endTime: new Date(2026, 3, 4, 10, 0), protocol: "16:8", targetDurationMs: 16 * 60 * 60 * 1000, status: "completed" });
    await evaluateFastingStreak(new Date(2026, 3, 4, 10, 0));
    const streak = await getStreak("fasting");
    expect(streak).toBeUndefined();
  });
});

describe("evaluateHydrationStreak", () => {
  it("starts a streak when daily goal is met", async () => {
    const today = new Date(2026, 3, 4);
    await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
    await db.hydrationEntries.add({ timestamp: new Date(2026, 3, 4, 9, 0), amountMl: 2500 });
    await evaluateHydrationStreak(today);
    const streak = await getStreak("hydration");
    expect(streak).toBeDefined();
    expect(streak!.currentCount).toBe(1);
  });

  it("does not start streak when goal is not met", async () => {
    const today = new Date(2026, 3, 4);
    await db.userProfile.add({ selectedProtocol: "16:8", dailyWaterGoalMl: 2500, createdAt: new Date() });
    await db.hydrationEntries.add({ timestamp: new Date(2026, 3, 4, 9, 0), amountMl: 500 });
    await evaluateHydrationStreak(today);
    const streak = await getStreak("hydration");
    expect(streak).toBeUndefined();
  });
});
