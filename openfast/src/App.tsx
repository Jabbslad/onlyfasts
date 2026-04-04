import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { TabBar } from "./components/TabBar";
import { TimerScreen } from "./screens/Timer/TimerScreen";
import { MealLogScreen } from "./screens/MealLog/MealLogScreen";
import { HydrationScreen } from "./screens/Hydration/HydrationScreen";
import { ProgressScreen } from "./screens/Progress/ProgressScreen";
import { SettingsScreen } from "./screens/Settings/SettingsScreen";
import { TipsGuides } from "./screens/Settings/TipsGuides";
import { db } from "./db/database";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      const existing = await db.userProfile.count();
      if (existing === 0) {
        await db.userProfile.add({
          selectedProtocol: "16:8",
          dailyWaterGoalMl: 2500,
          createdAt: new Date(),
        });
      }
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center bg-navy-900">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-[100dvh] bg-navy-900 text-white">
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<TimerScreen />} />
            <Route path="/log" element={<MealLogScreen />} />
            <Route path="/hydration" element={<HydrationScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/settings/guides" element={<TipsGuides />} />
          </Routes>
        </main>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}
