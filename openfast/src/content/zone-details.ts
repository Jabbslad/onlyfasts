export interface ZoneDetail {
  summary: string;
  bodyChanges: string[];
  benefits: string[];
  tip: string;
}

export const ZONE_DETAILS: Record<string, ZoneDetail> = {
  anabolic: {
    summary:
      "Your body is actively digesting and distributing nutrients from your last meal. Blood sugar and insulin levels are elevated as energy is absorbed.",
    bodyChanges: [
      "Stomach and intestines are breaking down food",
      "Blood glucose rises as carbohydrates are absorbed",
      "Insulin is released to shuttle nutrients into cells",
      "Excess energy is stored as glycogen and fat",
    ],
    benefits: [
      "Muscles receive amino acids for repair",
      "Energy stores are replenished",
      "Nutrient absorption is at its peak",
    ],
    tip: "Stay hydrated — water aids digestion and helps your body transition into the fasting state more smoothly.",
  },
  catabolic: {
    summary:
      "With no incoming food, your body shifts to burning stored glycogen for energy. Blood sugar and insulin levels begin to drop steadily.",
    bodyChanges: [
      "Liver glycogen is converted to glucose for fuel",
      "Insulin levels decline, reducing fat storage signals",
      "Glucagon rises, promoting energy release from stores",
      "Autophagy (cellular cleanup) begins at a low level",
    ],
    benefits: [
      "Blood sugar stabilizes, reducing cravings",
      "The body begins accessing fat reserves",
      "Early cellular repair processes start",
    ],
    tip: "Hunger may peak during this phase. Black coffee, tea, or sparkling water can help you push through without breaking your fast.",
  },
  fat_burning: {
    summary:
      "Glycogen stores are running low and your body has shifted to relying primarily on fat for energy. Insulin is at its lowest point so far.",
    bodyChanges: [
      "Lipolysis breaks down stored fat into free fatty acids",
      "Fatty acids become the primary energy source",
      "Insulin drops to baseline, unlocking fat stores",
      "Growth hormone levels begin to rise significantly",
    ],
    benefits: [
      "Accelerated fat loss and body recomposition",
      "Improved insulin sensitivity",
      "Enhanced mental clarity from stable energy supply",
    ],
    tip: "Light exercise like walking can amplify fat oxidation during this phase. Avoid intense workouts without experience fasting this long.",
  },
  ketosis: {
    summary:
      "Fat burning is in full swing. Your liver converts fatty acids into ketone bodies, providing an efficient alternative fuel for your brain and muscles.",
    bodyChanges: [
      "Ketone production increases steadily",
      "Brain shifts from glucose to ketones for fuel",
      "Autophagy ramps up — cells recycle damaged components",
      "Anti-inflammatory markers improve",
    ],
    benefits: [
      "Deep fat burning and metabolic flexibility",
      "Heightened mental focus from ketone-powered brain",
      "Significant cellular repair and renewal",
    ],
    tip: "Electrolytes become important during extended fasts. Consider adding a pinch of salt to your water if you feel lightheaded.",
  },
  deep_ketosis: {
    summary:
      "Ketone levels have plateaued at their peak. Your cells are fully engaged in deep cleanup, repair, and recycling processes known as autophagy.",
    bodyChanges: [
      "Ketone levels stabilize at maximum",
      "Autophagy reaches its highest intensity",
      "Stem cell regeneration may begin",
      "Immune system undergoes renewal",
    ],
    benefits: [
      "Maximum cellular repair and regeneration",
      "Potential immune system reset",
      "Deepest metabolic adaptation",
    ],
    tip: "Extended fasts beyond 24 hours should be approached with care. Listen to your body and consult a healthcare provider if this is new to you.",
  },
};
