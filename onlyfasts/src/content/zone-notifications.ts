export interface ZoneNotification {
  emoji: string;
  title: string;
  body: string;
}

export const ZONE_NOTIFICATIONS: Record<string, ZoneNotification> = {
  anabolic: {
    emoji: "\u26a1",
    title: "\u26a1 Anabolic Zone",
    body: "Your fast has begun! Your body is processing your last meal. Stay hydrated and the magic starts soon.",
  },
  catabolic: {
    emoji: "\ud83d\udd04",
    title: "\ud83d\udd04 Catabolic Zone",
    body: "You've entered the Catabolic zone! Your body is now burning through stored glycogen. Fat reserves are next \u2014 keep going!",
  },
  fat_burning: {
    emoji: "\ud83d\udd25",
    title: "\ud83d\udd25 Fat Burning Zone",
    body: "You've reached Fat Burning! Your body is now using fat as its primary fuel source. Insulin is low and growth hormone is rising. Amazing work!",
  },
  ketosis: {
    emoji: "\u2697\ufe0f",
    title: "\u2697\ufe0f Ketosis Zone",
    body: "Welcome to Ketosis! Your liver is producing ketones and your brain is switching to this super fuel. Deep cellular repair is underway. Incredible discipline!",
  },
  deep_ketosis: {
    emoji: "\ud83e\uddec",
    title: "\ud83e\uddec Deep Ketosis Zone",
    body: "You've entered Deep Ketosis! Your cells are in full repair mode \u2014 autophagy is at its peak. This is elite-level fasting. Be proud!",
  },
};
