export interface OnboardingSlide {
  id: string;
  headline: string;
  body: string;
  highlights: string[];
  accentColor: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    headline: "Your Body Is a Machine.\nLearn to Unlock It.",
    body: "Intermittent fasting is one of the most powerful tools for transforming your health — backed by science, practiced for centuries.",
    highlights: [
      "100% private — your data never leaves your device",
      "No accounts, no servers, no tracking",
      "Works completely offline as a PWA",
    ],
    accentColor: "#f0f0fa",
  },
  {
    id: "zones",
    headline: "Five Metabolic Zones.\nOne Powerful Journey.",
    body: "Every hour of fasting pushes your body deeper into metabolic transformation. Track your progress through five distinct zones.",
    highlights: [
      "Anabolic → Catabolic → Fat Burning",
      "Ketosis → Deep Ketosis for extended fasts",
      "Real-time zone tracking with a beautiful progress ring",
    ],
    accentColor: "#f0f0fa",
  },
  {
    id: "benefits",
    headline: "Burn Fat. Sharpen Focus.\nRenew Your Cells.",
    body: "Fasting triggers autophagy — your body's natural cellular cleanup. Old, damaged cells are recycled and replaced with fresh ones.",
    highlights: [
      "Accelerated fat burning and improved insulin sensitivity",
      "Enhanced mental clarity and sustained energy",
      "Cellular repair and reduced inflammation",
    ],
    accentColor: "#f0f0fa",
  },
  {
    id: "start",
    headline: "Track Every Fast.\nOwn Your Progress.",
    body: "Choose from proven fasting protocols, track your hydration, build streaks, and earn badges as you master the art of fasting.",
    highlights: [
      "Multiple protocols from 16:8 to extended fasts",
      "Hydration tracking to stay healthy while fasting",
      "Streaks and badges to keep you motivated",
    ],
    accentColor: "#f0f0fa",
  },
];
