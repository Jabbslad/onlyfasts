export interface Protocol {
  id: string;
  name: string;
  fastingHours: number;
  eatingHours: number;
  category: "Beginner" | "Popular" | "Intermediate" | "Advanced" | "Weekly";
  isWeekly: boolean;
}

export type FastingStatus = "active" | "completed" | "cancelled";

export interface FastingSession {
  id?: number;
  startTime: Date;
  endTime?: Date;
  protocol: string;
  targetDurationMs: number;
  status: FastingStatus;
  notes?: string;
}

export interface MealLog {
  id?: number;
  timestamp: Date;
  description: string;
  fastingSessionId?: number;
}

export interface HydrationEntry {
  id?: number;
  timestamp: Date;
  amountMl: number;
}

export type StreakType = "fasting" | "hydration";

export interface Streak {
  id?: number;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastCompletedDate: Date;
}

export type BadgeType =
  | "first_fast"
  | "week_warrior"
  | "month_master"
  | "century"
  | "hydro_start"
  | "hydro_habit"
  | "extended"
  | "early_bird"
  | "protocol_explorer";

export interface Badge {
  id?: number;
  type: BadgeType;
  name: string;
  description: string;
  earnedAt: Date;
}

export interface FastingZone {
  id: string;
  name: string;
  startHour: number;
  endHour: number | null;
  color: string;
  glowColor: string;
  description: string;
}

export interface UserProfile {
  id?: number;
  name?: string;
  selectedProtocol: string;
  dailyWaterGoalMl: number;
  createdAt: Date;
  onboardingCompleted?: boolean;
}
