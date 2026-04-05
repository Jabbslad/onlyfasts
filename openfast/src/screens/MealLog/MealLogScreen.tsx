import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { getStartOfDay, getEndOfDay, formatTime, isSameDay } from "../../utils/time";
import type { MealLog } from "../../types";

function getDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  if (isSameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function MealLogScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newMealText, setNewMealText] = useState("");

  const loadMeals = useCallback(async (date: Date) => {
    const start = getStartOfDay(date);
    const end = getEndOfDay(date);
    const results = await db.mealLogs
      .where("timestamp")
      .between(start, end, true, true)
      .toArray();
    setMeals(results);
  }, []);

  useEffect(() => {
    loadMeals(selectedDate);
  }, [selectedDate, loadMeals]);

  const handleLogMeal = () => {
    setNewMealText("");
    setShowModal(true);
  };

  const handleSave = async () => {
    const trimmed = newMealText.trim();
    if (!trimmed) return;
    await db.mealLogs.add({ timestamp: new Date(), description: trimmed });
    setShowModal(false);
    setNewMealText("");
    loadMeals(selectedDate);
  };

  const handleCancel = () => {
    setShowModal(false);
    setNewMealText("");
  };

  const handleDelete = async (id: number) => {
    await db.mealLogs.delete(id);
    loadMeals(selectedDate);
  };

  const goYesterday = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToday = () => {
    setSelectedDate(new Date());
  };

  const goTomorrow = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const dateLabel = getDateLabel(selectedDate);

  return (
    <div className="flex-1 bg-transparent px-4 py-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-semibold text-[#f0f0fa]">{dateLabel}</h1>
        <button onClick={handleLogMeal}
          className="bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-[#f0f0fa] px-5 py-2 rounded-[32px] text-sm font-semibold min-h-[44px] transition-all duration-200 hover:bg-[rgba(240,240,250,0.15)]">
          + Log Meal
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {meals.length === 0 && (
          <div className="text-[#f0f0fa]/30 text-sm text-center py-12">No meals logged</div>
        )}
        {meals.map((meal) => (
          <div key={meal.id} className="bg-[rgba(240,240,250,0.03)] border border-[rgba(240,240,250,0.06)] rounded-xl p-4 flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-[#f0f0fa] text-sm">{meal.description}</span>
              <span className="text-[#f0f0fa]/40 text-xs ml-3">{formatTime(meal.timestamp)}</span>
            </div>
            <button onClick={() => handleDelete(meal.id!)} aria-label="delete"
              className="text-[#f0f0fa]/30 hover:text-[#f0f0fa]/60 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-8 text-sm">
        <button onClick={goYesterday} className="text-[#f0f0fa]/40 hover:text-[#f0f0fa]/60 min-h-[44px] transition-colors">&larr; Yesterday</button>
        <button onClick={goToday} className="text-[#f0f0fa] font-medium min-h-[44px]">Today</button>
        <button onClick={goTomorrow} className="text-[#f0f0fa]/40 hover:text-[#f0f0fa]/60 min-h-[44px] transition-colors">Tomorrow &rarr;</button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4">
          <div className="bg-black border border-[rgba(240,240,250,0.06)] rounded-2xl p-6 w-full max-w-sm mb-4">
            <h3 className="text-sm font-bold tracking-[1.17px] text-[#f0f0fa] mb-4">Log a Meal</h3>
            <input type="text" value={newMealText} onChange={(e) => setNewMealText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="What did you eat?"
              className="w-full bg-black border border-[rgba(240,240,250,0.35)] rounded-xl px-4 py-3.5 text-white placeholder-gray-600 mb-4 focus:outline-none focus:border-[rgba(240,240,250,0.6)] transition-colors" autoFocus />
            <div className="flex gap-3">
              <button onClick={handleCancel} className="flex-1 py-3 rounded-xl bg-[rgba(240,240,250,0.06)] text-sm font-medium min-h-[44px] text-[#f0f0fa]/70 hover:bg-[rgba(240,240,250,0.1)] transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-[rgba(240,240,250,0.1)] border border-[rgba(240,240,250,0.35)] text-sm font-medium min-h-[44px] text-[#f0f0fa] hover:bg-[rgba(240,240,250,0.15)] transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
