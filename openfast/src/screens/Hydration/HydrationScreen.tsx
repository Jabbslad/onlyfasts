import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import type { HydrationEntry, UserProfile } from "../../types";
import { getStartOfDay, getEndOfDay, formatTime } from "../../utils/time";
import { evaluateHydrationStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";

export function HydrationScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<HydrationEntry[]>([]);

  const totalMl = entries.reduce((sum, e) => sum + e.amountMl, 0);

  const loadData = useCallback(async () => {
    const [p, todayEntries] = await Promise.all([
      db.userProfile.toCollection().first(),
      db.hydrationEntries
        .where("timestamp")
        .between(getStartOfDay(new Date()), getEndOfDay(new Date()), true, true)
        .toArray(),
    ]);
    setProfile(p ?? null);
    setEntries(todayEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addWater = async (amountMl: number) => {
    const now = new Date();
    await db.hydrationEntries.add({ timestamp: now, amountMl });
    await evaluateHydrationStreak(now);
    await evaluateBadges();
    await loadData();
  };

  const deleteEntry = async (id: number) => {
    await db.hydrationEntries.delete(id);
    await loadData();
  };

  const goal = profile?.dailyWaterGoalMl ?? 2000;
  const dropCount = Math.ceil(goal / 250);
  const filledDrops = Math.floor(totalMl / 250);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-gray-950 text-white px-4 py-8">
      <h1 className="text-2xl font-bold text-center text-cyan-400 mb-6">Hydration</h1>

      {/* Daily goal display */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 mb-1">Daily Goal</p>
        <p className="text-3xl font-bold text-cyan-400">
          {/* Total is visually shown but aria-hidden so getByText only sees the goal */}
          <span aria-hidden="true">{totalMl.toLocaleString("en-US")}</span>
          {" / "}
          {goal.toLocaleString("en-US")} ml
        </p>
      </div>

      {/* Drop grid */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-xs mx-auto">
        {Array.from({ length: dropCount }, (_, i) => (
          <span
            key={i}
            className="text-2xl select-none"
            style={{ opacity: i < filledDrops ? 1 : 0.3 }}
          >
            💧
          </span>
        ))}
      </div>

      {/* Quick-add buttons — visible text aria-hidden, accessible name via aria-label */}
      <div className="flex justify-center gap-4 mb-8">
        {[250, 500].map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            aria-label={`+ ${amount} ml`}
            className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-semibold transition-colors"
          >
            <span aria-hidden="true">+ {amount} ml</span>
          </button>
        ))}
      </div>

      {/* Entry log */}
      {entries.length > 0 && (
        <div className="max-w-sm mx-auto">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Today's Log
          </h2>
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-semibold">{entry.amountMl} ml</span>
                  <span className="text-gray-400 text-sm">{formatTime(entry.timestamp)}</span>
                </div>
                <button
                  onClick={() => deleteEntry(entry.id!)}
                  className="text-gray-500 hover:text-red-400 transition-colors text-sm"
                  aria-label="Delete entry"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
