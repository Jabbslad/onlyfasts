import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/database";
import { startFast, endFast, getActiveFast, cancelFast } from "./useFastingTimer";

beforeEach(async () => { await db.delete(); await db.open(); });

describe("startFast", () => {
  it("creates an active fasting session", async () => {
    const id = await startFast("16:8");
    const session = await db.fastingSessions.get(id);
    expect(session).toBeDefined();
    expect(session!.status).toBe("active");
    expect(session!.protocol).toBe("16:8");
    expect(session!.targetDurationMs).toBe(16 * 60 * 60 * 1000);
  });
  it("throws if a fast is already active", async () => {
    await startFast("16:8");
    await expect(startFast("16:8")).rejects.toThrow("A fast is already active");
  });
});

describe("endFast", () => {
  it("marks the session as completed", async () => {
    const id = await startFast("16:8");
    await endFast(id);
    const session = await db.fastingSessions.get(id);
    expect(session!.status).toBe("completed");
    expect(session!.endTime).toBeDefined();
  });
});

describe("cancelFast", () => {
  it("marks the session as cancelled", async () => {
    const id = await startFast("16:8");
    await cancelFast(id);
    const session = await db.fastingSessions.get(id);
    expect(session!.status).toBe("cancelled");
  });
});

describe("getActiveFast", () => {
  it("returns undefined when no fast is active", async () => {
    expect(await getActiveFast()).toBeUndefined();
  });
  it("returns the active fast", async () => {
    await startFast("18:6");
    const active = await getActiveFast();
    expect(active).toBeDefined();
    expect(active!.protocol).toBe("18:6");
  });
});
