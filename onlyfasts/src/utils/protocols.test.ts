import { describe, it, expect } from "vitest";
import { PROTOCOLS, getProtocol, getTargetDurationMs } from "./protocols";

describe("protocols", () => {
  it("has 7 protocols defined", () => {
    expect(PROTOCOLS).toHaveLength(7);
  });

  it("getProtocol returns a protocol by id", () => {
    const p = getProtocol("16:8");
    expect(p).toBeDefined();
    expect(p!.fastingHours).toBe(16);
    expect(p!.eatingHours).toBe(8);
    expect(p!.category).toBe("Popular");
  });

  it("getProtocol returns undefined for unknown id", () => {
    expect(getProtocol("99:1")).toBeUndefined();
  });

  it("getTargetDurationMs returns correct milliseconds", () => {
    expect(getTargetDurationMs("16:8")).toBe(16 * 60 * 60 * 1000);
  });

  it("getTargetDurationMs returns 0 for 5:2 protocol", () => {
    expect(getTargetDurationMs("5:2")).toBe(0);
  });

  it("OMAD has 23h fasting window", () => {
    const p = getProtocol("OMAD");
    expect(p!.fastingHours).toBe(23);
  });
});
