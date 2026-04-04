import type { Protocol } from "../types";

export const PROTOCOLS: Protocol[] = [
  { id: "12:12", name: "12:12", fastingHours: 12, eatingHours: 12, category: "Beginner", isWeekly: false },
  { id: "14:10", name: "14:10", fastingHours: 14, eatingHours: 10, category: "Beginner", isWeekly: false },
  { id: "16:8", name: "16:8", fastingHours: 16, eatingHours: 8, category: "Popular", isWeekly: false },
  { id: "18:6", name: "18:6", fastingHours: 18, eatingHours: 6, category: "Intermediate", isWeekly: false },
  { id: "20:4", name: "20:4", fastingHours: 20, eatingHours: 4, category: "Advanced", isWeekly: false },
  { id: "OMAD", name: "OMAD", fastingHours: 23, eatingHours: 1, category: "Advanced", isWeekly: false },
  { id: "5:2", name: "5:2", fastingHours: 0, eatingHours: 0, category: "Weekly", isWeekly: true },
];

export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}

export function getTargetDurationMs(protocolId: string): number {
  const p = getProtocol(protocolId);
  if (!p || p.isWeekly) return 0;
  return p.fastingHours * 60 * 60 * 1000;
}
