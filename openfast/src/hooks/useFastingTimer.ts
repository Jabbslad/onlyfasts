import { db } from "../db/database";
import { getTargetDurationMs } from "../utils/protocols";
import type { FastingSession } from "../types";

export async function startFast(protocolId: string): Promise<number> {
  const existing = await getActiveFast();
  if (existing) throw new Error("A fast is already active");
  const id = await db.fastingSessions.add({
    startTime: new Date(), protocol: protocolId,
    targetDurationMs: getTargetDurationMs(protocolId), status: "active",
  });
  return id as number;
}

export async function endFast(sessionId: number): Promise<void> {
  await db.fastingSessions.update(sessionId, { endTime: new Date(), status: "completed" });
}

export async function cancelFast(sessionId: number): Promise<void> {
  await db.fastingSessions.update(sessionId, { endTime: new Date(), status: "cancelled" });
}

export async function getActiveFast(): Promise<FastingSession | undefined> {
  return db.fastingSessions.where("status").equals("active").first();
}
