import type { FastingZone } from "../types";

const ZONES: FastingZone[] = [
  {
    id: "anabolic",
    name: "Anabolic",
    startHour: 0,
    endHour: 4,
    color: "#f0f0fa",
    glowColor: "transparent",
    opacity: 0.15,
    description: "Your body is digesting and distributing nutrients from your last meal.",
  },
  {
    id: "catabolic",
    name: "Catabolic",
    startHour: 4,
    endHour: 16,
    color: "#f0f0fa",
    glowColor: "transparent",
    opacity: 0.25,
    description: "Your body is burning through stored glycogen and beginning to tap into fat reserves.",
  },
  {
    id: "fat_burning",
    name: "Fat Burning",
    startHour: 16,
    endHour: 24,
    color: "#f0f0fa",
    glowColor: "transparent",
    opacity: 0.40,
    description: "Your body has shifted to relying primarily on fat for energy. Insulin levels are low.",
  },
  {
    id: "ketosis",
    name: "Ketosis",
    startHour: 24,
    endHour: 72,
    color: "#f0f0fa",
    glowColor: "transparent",
    opacity: 0.60,
    description: "Fat burning is in full swing and ketone production is gradually increasing.",
  },
  {
    id: "deep_ketosis",
    name: "Deep Ketosis",
    startHour: 72,
    endHour: null,
    color: "#f0f0fa",
    glowColor: "transparent",
    opacity: 0.85,
    description: "Ketone levels have plateaued. Your cells are engaged in cleanup, repair, and recycling.",
  },
];

export function getElapsedHours(elapsedMs: number): number {
  return elapsedMs / 3_600_000;
}

export function getZoneForElapsedMs(elapsedMs: number): FastingZone {
  const hours = getElapsedHours(elapsedMs);
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (hours >= ZONES[i].startHour) {
      return ZONES[i];
    }
  }
  return ZONES[0];
}

export function getZoneProgress(elapsedMs: number): number {
  const hours = getElapsedHours(elapsedMs);
  const zone = getZoneForElapsedMs(elapsedMs);
  const elapsed = hours - zone.startHour;
  const duration = zone.endHour !== null ? zone.endHour - zone.startHour : 24;
  return Math.min(elapsed / duration, 1);
}

export function getAllZones(): FastingZone[] {
  return ZONES;
}
