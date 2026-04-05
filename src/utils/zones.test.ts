import { describe, it, expect } from "vitest";
import { getZoneForElapsedMs, getZoneProgress, getAllZones, getElapsedHours } from "./zones";

const h = (hours: number) => hours * 3_600_000;

describe("getElapsedHours", () => {
  it("converts ms to hours", () => {
    expect(getElapsedHours(h(5))).toBe(5);
    expect(getElapsedHours(0)).toBe(0);
  });
});

describe("getZoneForElapsedMs", () => {
  it("returns Anabolic at 0h", () => {
    expect(getZoneForElapsedMs(0).id).toBe("anabolic");
  });
  it("returns Anabolic at 2h", () => {
    expect(getZoneForElapsedMs(h(2)).id).toBe("anabolic");
  });
  it("returns Catabolic at 4h boundary", () => {
    expect(getZoneForElapsedMs(h(4)).id).toBe("catabolic");
  });
  it("returns Catabolic at 10h", () => {
    expect(getZoneForElapsedMs(h(10)).id).toBe("catabolic");
  });
  it("returns Fat Burning at 16h", () => {
    expect(getZoneForElapsedMs(h(16)).id).toBe("fat_burning");
  });
  it("returns Ketosis at 24h", () => {
    expect(getZoneForElapsedMs(h(24)).id).toBe("ketosis");
  });
  it("returns Deep Ketosis at 72h", () => {
    expect(getZoneForElapsedMs(h(72)).id).toBe("deep_ketosis");
  });
  it("returns Deep Ketosis at 200h", () => {
    expect(getZoneForElapsedMs(h(200)).id).toBe("deep_ketosis");
  });
});

describe("getZoneProgress", () => {
  it("returns 0 at zone start", () => {
    expect(getZoneProgress(0)).toBe(0);
    expect(getZoneProgress(h(4))).toBe(0);
    expect(getZoneProgress(h(16))).toBe(0);
  });
  it("returns ~0.5 at midpoint", () => {
    expect(getZoneProgress(h(2))).toBe(0.5); // Anabolic: 2/4
    expect(getZoneProgress(h(10))).toBe(0.5); // Catabolic: 6/12
    expect(getZoneProgress(h(20))).toBe(0.5); // Fat Burning: 4/8
  });
  it("returns 1 at zone end", () => {
    expect(getZoneProgress(h(3.99))).toBeCloseTo(0.9975);
  });
  it("caps at 1 for unbounded zone", () => {
    expect(getZoneProgress(h(96))).toBe(1); // 72+24 = capped
    expect(getZoneProgress(h(200))).toBe(1);
  });
});

describe("getAllZones", () => {
  it("returns 5 zones", () => {
    expect(getAllZones()).toHaveLength(5);
  });
  it("zones are in order", () => {
    const zones = getAllZones();
    expect(zones[0].id).toBe("anabolic");
    expect(zones[4].id).toBe("deep_ketosis");
  });
});
