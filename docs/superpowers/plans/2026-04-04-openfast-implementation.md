# OpenFast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a privacy-first fasting tracker PWA with local-only storage, fasting timer, meal logging, hydration tracking, streaks, and badges.

**Architecture:** React 18 + TypeScript SPA with Vite build tooling. All data stored in IndexedDB via Dexie.js. Offline-first PWA with Workbox service worker. 5-tab bottom navigation (Timer, Meal Log, Hydration, Progress, Settings) with a dark theme throughout.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Dexie.js, Workbox (vite-plugin-pwa), React Router v6, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-04-04-open-fast-prd-design.md`

---

## File Structure

```
openfast/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
├── LICENSE
├── README.md
├── public/
│   ├── manifest.json
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                    # Tailwind directives + dark theme globals
│   ├── types/
│   │   └── index.ts                 # All shared TypeScript types
│   ├── db/
│   │   ├── database.ts              # Dexie DB class, schema, migrations
│   │   ├── export-import.ts         # JSON export/import/clear utilities
│   │   └── database.test.ts         # DB schema + CRUD tests
│   ├── utils/
│   │   ├── protocols.ts             # Protocol definitions and helpers
│   │   ├── protocols.test.ts
│   │   ├── time.ts                  # Duration formatting, date helpers
│   │   ├── time.test.ts
│   │   ├── notifications.ts         # Notification API wrapper
│   │   └── notifications.test.ts
│   ├── hooks/
│   │   ├── useFastingTimer.ts       # Timer state machine hook
│   │   ├── useFastingTimer.test.ts
│   │   ├── useStreaks.ts            # Streak evaluation hook
│   │   ├── useStreaks.test.ts
│   │   ├── useBadges.ts            # Badge evaluation hook
│   │   ├── useBadges.test.ts
│   │   └── useHydration.ts         # Daily hydration aggregation hook
│   ├── components/
│   │   ├── ProgressRing.tsx         # Circular SVG progress ring
│   │   ├── ProgressRing.test.tsx
│   │   ├── TabBar.tsx               # Bottom 5-tab navigation
│   │   ├── TabBar.test.tsx
│   │   ├── Toast.tsx                # Badge earned notification toast
│   │   ├── Toast.test.tsx
│   │   └── ConfirmDialog.tsx        # Reusable confirmation modal
│   ├── screens/
│   │   ├── Timer/
│   │   │   ├── TimerScreen.tsx
│   │   │   └── TimerScreen.test.tsx
│   │   ├─��� MealLog/
│   │   │   ├── MealLogScreen.tsx
│   │   │   └── MealLogScreen.test.tsx
│   │   ├── Hydration/
│   │   │   ├── HydrationScreen.tsx
│   │   │   └── HydrationScreen.test.tsx
│   │   ├── Progress/
│   │   │   ├── ProgressScreen.tsx
│   │   │   └── ProgressScreen.test.tsx
│   │   └── Settings/
│   │       ├── SettingsScreen.tsx
│   │       ├── SettingsScreen.test.tsx
│   │       ├── TipsGuides.tsx
│   │       └─�� TipsGuides.test.tsx
│   └── content/
│       └── guides.ts               # Bundled tips & guides data
```

---

## Task 1: Project Scaffolding & Tooling

**Files:**
- Create: `openfast/package.json`
- Create: `openfast/tsconfig.json`
- Create: `openfast/vite.config.ts`
- Create: `openfast/tailwind.config.ts`
- Create: `openfast/postcss.config.js`
- Create: `openfast/index.html`
- Create: `openfast/.gitignore`
- Create: `openfast/src/main.tsx`
- Create: `openfast/src/App.tsx`
- Create: `openfast/src/index.css`

- [ ] **Step 1: Initialize the project directory**

```bash
mkdir -p openfast/src openfast/public/icons
cd openfast
```

- [ ] **Step 2: Create package.json**

Create `openfast/package.json`:

```json
{
  "name": "openfast",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "dexie": "^4.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^25.0.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

Create `openfast/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create vite.config.ts**

Create `openfast/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "OpenFast",
        short_name: "OpenFast",
        description: "Privacy-first fasting & wellness tracker",
        theme_color: "#0f0f1a",
        background_color: "#0f0f1a",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    css: true,
  },
});
```

- [ ] **Step 5: Create Tailwind and PostCSS config**

Create `openfast/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0f0f1a",
          800: "#1a1a2e",
          700: "#2a2a4a",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Create `openfast/postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 6: Create index.html**

Create `openfast/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0f0f1a" />
    <title>OpenFast</title>
  </head>
  <body class="bg-navy-900 text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create src/index.css**

Create `openfast/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  margin: 0;
  min-height: 100dvh;
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 8: Create placeholder App and entry point**

Create `openfast/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

Create `openfast/src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="flex-1 flex items-center justify-center bg-navy-900">
      <h1 className="text-2xl font-bold text-indigo-400">OpenFast</h1>
    </div>
  );
}
```

- [ ] **Step 9: Create test setup and .gitignore**

Create `openfast/src/test-setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
```

Create `openfast/.gitignore`:

```
node_modules
dist
.superpowers
*.local
```

- [ ] **Step 10: Install dependencies and verify**

```bash
cd openfast && npm install
```

Run: `npm run lint`
Expected: No errors

Run: `npm run build`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 11: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold OpenFast project with Vite, React, Tailwind, PWA"
```

---

## Task 2: Types & Protocol Definitions

**Files:**
- Create: `openfast/src/types/index.ts`
- Create: `openfast/src/utils/protocols.ts`
- Create: `openfast/src/utils/protocols.test.ts`

- [ ] **Step 1: Write the failing test for protocol helpers**

Create `openfast/src/utils/protocols.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  PROTOCOLS,
  getProtocol,
  getTargetDurationMs,
} from "./protocols";

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
    // 16 hours = 57,600,000 ms
    expect(getTargetDurationMs("16:8")).toBe(16 * 60 * 60 * 1000);
  });

  it("getTargetDurationMs returns 0 for 5:2 protocol", () => {
    // 5:2 has no continuous timer
    expect(getTargetDurationMs("5:2")).toBe(0);
  });

  it("OMAD has 23h fasting window", () => {
    const p = getProtocol("OMAD");
    expect(p!.fastingHours).toBe(23);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd openfast && npx vitest run src/utils/protocols.test.ts`
Expected: FAIL — cannot find module `./protocols`

- [ ] **Step 3: Create types**

Create `openfast/src/types/index.ts`:

```typescript
export interface Protocol {
  id: string;
  name: string;
  fastingHours: number;
  eatingHours: number;
  category: "Beginner" | "Popular" | "Intermediate" | "Advanced" | "Weekly";
  isWeekly: boolean;
}

export type FastingStatus = "active" | "completed" | "cancelled";

export interface FastingSession {
  id?: number;
  startTime: Date;
  endTime?: Date;
  protocol: string;
  targetDurationMs: number;
  status: FastingStatus;
  notes?: string;
}

export interface MealLog {
  id?: number;
  timestamp: Date;
  description: string;
  fastingSessionId?: number;
}

export interface HydrationEntry {
  id?: number;
  timestamp: Date;
  amountMl: number;
}

export type StreakType = "fasting" | "hydration";

export interface Streak {
  id?: number;
  type: StreakType;
  currentCount: number;
  longestCount: number;
  lastCompletedDate: Date;
}

export type BadgeType =
  | "first_fast"
  | "week_warrior"
  | "month_master"
  | "century"
  | "hydro_start"
  | "hydro_habit"
  | "extended"
  | "early_bird"
  | "protocol_explorer";

export interface Badge {
  id?: number;
  type: BadgeType;
  name: string;
  description: string;
  earnedAt: Date;
}

export interface UserProfile {
  id?: number;
  name?: string;
  selectedProtocol: string;
  dailyWaterGoalMl: number;
  createdAt: Date;
}
```

- [ ] **Step 4: Implement protocols**

Create `openfast/src/utils/protocols.ts`:

```typescript
import type { Protocol } from "../types";

export const PROTOCOLS: Protocol[] = [
  { id: "12:12", name: "12:12", fastingHours: 12, eatingHours: 12, category: "Beginner", isWeekly: false },
  { id: "14:10", name: "14:10", fastingHours: 14, eatingHours: 10, category: "Beginner", isWeekly: false },
  { id: "16:8", name: "16:8", fastingHours: 16, eatingHours: 8, category: "Popular", isWeekly: false },
  { id: "18:6", name: "18:6", fastingHours: 18, eatingHours: 6, category: "Intermediate", isWeekly: false },
  { id: "20:4", name: "20:4", fastingHours: 20, eatingHours: 4, category: "Advanced", isWeekly: false },
  { id: "OMAD", name: "OMAD", fastingHours: 23, eatingHours: 1, category: "Advanced", isWeekly: false },
  { id: "5:2", name: "5:2", fastingHours: 0, eatingHours: 0, category: "Weekly", isWeekly: true },
];

export function getProtocol(id: string): Protocol | undefined {
  return PROTOCOLS.find((p) => p.id === id);
}

export function getTargetDurationMs(protocolId: string): number {
  const p = getProtocol(protocolId);
  if (!p || p.isWeekly) return 0;
  return p.fastingHours * 60 * 60 * 1000;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/utils/protocols.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
cd openfast && git add src/types/index.ts src/utils/protocols.ts src/utils/protocols.test.ts
git commit -m "feat: add TypeScript types and protocol definitions"
```

---

## Task 3: Time Utilities

**Files:**
- Create: `openfast/src/utils/time.ts`
- Create: `openfast/src/utils/time.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `openfast/src/utils/time.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatTime,
  getStartOfDay,
  getEndOfDay,
  isSameDay,
} from "./time";

describe("formatDuration", () => {
  it("formats zero ms", () => {
    expect(formatDuration(0)).toBe("00:00:00");
  });

  it("formats hours, minutes, seconds", () => {
    // 12h 4m 33s = 43,473,000 ms
    expect(formatDuration(43_473_000)).toBe("12:04:33");
  });

  it("formats over 24 hours", () => {
    // 25h 0m 0s
    expect(formatDuration(90_000_000)).toBe("25:00:00");
  });
});

describe("formatTime", () => {
  it("formats a date to HH:MM AM/PM", () => {
    const d = new Date(2026, 3, 4, 14, 30);
    expect(formatTime(d)).toBe("2:30 PM");
  });

  it("formats midnight", () => {
    const d = new Date(2026, 3, 4, 0, 0);
    expect(formatTime(d)).toBe("12:00 AM");
  });
});

describe("getStartOfDay / getEndOfDay", () => {
  it("getStartOfDay returns midnight", () => {
    const d = new Date(2026, 3, 4, 14, 30, 45);
    const start = getStartOfDay(d);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it("getEndOfDay returns 23:59:59.999", () => {
    const d = new Date(2026, 3, 4, 14, 30, 45);
    const end = getEndOfDay(d);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});

describe("isSameDay", () => {
  it("returns true for same day", () => {
    const a = new Date(2026, 3, 4, 10, 0);
    const b = new Date(2026, 3, 4, 22, 0);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("returns false for different days", () => {
    const a = new Date(2026, 3, 4, 23, 59);
    const b = new Date(2026, 3, 5, 0, 0);
    expect(isSameDay(a, b)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/utils/time.test.ts`
Expected: FAIL — cannot find module `./time`

- [ ] **Step 3: Implement time utilities**

Create `openfast/src/utils/time.ts`:

```typescript
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/utils/time.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/utils/time.ts src/utils/time.test.ts
git commit -m "feat: add time formatting and date utility functions"
```

---

## Task 4: Database Layer

**Files:**
- Create: `openfast/src/db/database.ts`
- Create: `openfast/src/db/database.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `openfast/src/db/database.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "./database";
import type { FastingSession, MealLog, HydrationEntry } from "../types";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("database schema", () => {
  it("has all expected tables", () => {
    const tableNames = db.tables.map((t) => t.name).sort();
    expect(tableNames).toEqual([
      "badges",
      "fastingSessions",
      "hydrationEntries",
      "mealLogs",
      "streaks",
      "userProfile",
    ]);
  });
});

describe("fastingSessions CRUD", () => {
  it("creates and retrieves a fasting session", async () => {
    const session: FastingSession = {
      startTime: new Date(2026, 3, 4, 20, 0),
      protocol: "16:8",
      targetDurationMs: 16 * 60 * 60 * 1000,
      status: "active",
    };
    const id = await db.fastingSessions.add(session);
    const retrieved = await db.fastingSessions.get(id);
    expect(retrieved).toBeDefined();
    expect(retrieved!.protocol).toBe("16:8");
    expect(retrieved!.status).toBe("active");
  });

  it("queries active sessions", async () => {
    await db.fastingSessions.add({
      startTime: new Date(),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "active",
    });
    await db.fastingSessions.add({
      startTime: new Date(),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
      endTime: new Date(),
    });

    const active = await db.fastingSessions
      .where("status")
      .equals("active")
      .toArray();
    expect(active).toHaveLength(1);
  });
});

describe("mealLogs CRUD", () => {
  it("creates and queries meals by date range", async () => {
    const today = new Date(2026, 3, 4, 12, 30);
    const yesterday = new Date(2026, 3, 3, 19, 0);

    await db.mealLogs.add({ timestamp: today, description: "Lunch" });
    await db.mealLogs.add({ timestamp: yesterday, description: "Dinner" });

    const startOfToday = new Date(2026, 3, 4, 0, 0, 0, 0);
    const endOfToday = new Date(2026, 3, 4, 23, 59, 59, 999);

    const todayMeals = await db.mealLogs
      .where("timestamp")
      .between(startOfToday, endOfToday, true, true)
      .toArray();
    expect(todayMeals).toHaveLength(1);
    expect(todayMeals[0].description).toBe("Lunch");
  });
});

describe("hydrationEntries CRUD", () => {
  it("creates entries and sums daily total", async () => {
    const t1 = new Date(2026, 3, 4, 9, 0);
    const t2 = new Date(2026, 3, 4, 11, 0);

    await db.hydrationEntries.add({ timestamp: t1, amountMl: 250 });
    await db.hydrationEntries.add({ timestamp: t2, amountMl: 500 });

    const startOfDay = new Date(2026, 3, 4, 0, 0, 0, 0);
    const endOfDay = new Date(2026, 3, 4, 23, 59, 59, 999);

    const entries = await db.hydrationEntries
      .where("timestamp")
      .between(startOfDay, endOfDay, true, true)
      .toArray();
    const total = entries.reduce((sum, e) => sum + e.amountMl, 0);
    expect(total).toBe(750);
  });
});

describe("userProfile", () => {
  it("creates and retrieves profile", async () => {
    await db.userProfile.add({
      selectedProtocol: "16:8",
      dailyWaterGoalMl: 2500,
      createdAt: new Date(),
    });
    const profiles = await db.userProfile.toArray();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].selectedProtocol).toBe("16:8");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/db/database.test.ts`
Expected: FAIL — cannot find module `./database`

- [ ] **Step 3: Implement the database**

Create `openfast/src/db/database.ts`:

```typescript
import Dexie, { type EntityTable } from "dexie";
import type {
  FastingSession,
  MealLog,
  HydrationEntry,
  Streak,
  Badge,
  UserProfile,
} from "../types";

class OpenFastDB extends Dexie {
  fastingSessions!: EntityTable<FastingSession, "id">;
  mealLogs!: EntityTable<MealLog, "id">;
  hydrationEntries!: EntityTable<HydrationEntry, "id">;
  streaks!: EntityTable<Streak, "id">;
  badges!: EntityTable<Badge, "id">;
  userProfile!: EntityTable<UserProfile, "id">;

  constructor() {
    super("openfast");
    this.version(1).stores({
      fastingSessions: "++id, startTime, status",
      mealLogs: "++id, timestamp",
      hydrationEntries: "++id, timestamp",
      streaks: "++id, &type",
      badges: "++id, &type",
      userProfile: "++id",
    });
  }
}

export const db = new OpenFastDB();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/db/database.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/db/database.ts src/db/database.test.ts
git commit -m "feat: add Dexie database with schema and indexes"
```

---

## Task 5: Data Export / Import / Clear

**Files:**
- Create: `openfast/src/db/export-import.ts`
- Add tests to: `openfast/src/db/database.test.ts`

- [ ] **Step 1: Write failing tests**

Append to `openfast/src/db/database.test.ts`:

```typescript
import { exportAllData, importAllData, clearAllData } from "./export-import";

describe("export/import", () => {
  it("exports all data as a JSON-serializable object", async () => {
    await db.userProfile.add({
      selectedProtocol: "16:8",
      dailyWaterGoalMl: 2500,
      createdAt: new Date(),
    });
    await db.fastingSessions.add({
      startTime: new Date(),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
      endTime: new Date(),
    });

    const exported = await exportAllData();
    expect(exported.userProfile).toHaveLength(1);
    expect(exported.fastingSessions).toHaveLength(1);
    expect(exported.version).toBe(1);
  });

  it("imports data in replace mode", async () => {
    await db.userProfile.add({
      selectedProtocol: "12:12",
      dailyWaterGoalMl: 2000,
      createdAt: new Date(),
    });

    const importData = {
      version: 1,
      userProfile: [
        {
          selectedProtocol: "18:6",
          dailyWaterGoalMl: 3000,
          createdAt: new Date().toISOString(),
        },
      ],
      fastingSessions: [],
      mealLogs: [],
      hydrationEntries: [],
      streaks: [],
      badges: [],
    };

    await importAllData(importData, "replace");
    const profiles = await db.userProfile.toArray();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].selectedProtocol).toBe("18:6");
  });

  it("clearAllData empties all tables", async () => {
    await db.userProfile.add({
      selectedProtocol: "16:8",
      dailyWaterGoalMl: 2500,
      createdAt: new Date(),
    });
    await db.fastingSessions.add({
      startTime: new Date(),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "active",
    });

    await clearAllData();

    expect(await db.userProfile.count()).toBe(0);
    expect(await db.fastingSessions.count()).toBe(0);
    expect(await db.mealLogs.count()).toBe(0);
    expect(await db.hydrationEntries.count()).toBe(0);
    expect(await db.streaks.count()).toBe(0);
    expect(await db.badges.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/db/database.test.ts`
Expected: FAIL — cannot find module `./export-import`

- [ ] **Step 3: Implement export/import**

Create `openfast/src/db/export-import.ts`:

```typescript
import { db } from "./database";

interface ExportData {
  version: number;
  userProfile: unknown[];
  fastingSessions: unknown[];
  mealLogs: unknown[];
  hydrationEntries: unknown[];
  streaks: unknown[];
  badges: unknown[];
}

export async function exportAllData(): Promise<ExportData> {
  return {
    version: 1,
    userProfile: await db.userProfile.toArray(),
    fastingSessions: await db.fastingSessions.toArray(),
    mealLogs: await db.mealLogs.toArray(),
    hydrationEntries: await db.hydrationEntries.toArray(),
    streaks: await db.streaks.toArray(),
    badges: await db.badges.toArray(),
  };
}

export async function importAllData(
  data: ExportData,
  mode: "replace" | "merge"
): Promise<void> {
  if (mode === "replace") {
    await clearAllData();
  }

  await db.transaction(
    "rw",
    [
      db.userProfile,
      db.fastingSessions,
      db.mealLogs,
      db.hydrationEntries,
      db.streaks,
      db.badges,
    ],
    async () => {
      for (const item of data.userProfile) {
        await db.userProfile.add(parseDates(item as Record<string, unknown>));
      }
      for (const item of data.fastingSessions) {
        await db.fastingSessions.add(parseDates(item as Record<string, unknown>) as never);
      }
      for (const item of data.mealLogs) {
        await db.mealLogs.add(parseDates(item as Record<string, unknown>) as never);
      }
      for (const item of data.hydrationEntries) {
        await db.hydrationEntries.add(parseDates(item as Record<string, unknown>) as never);
      }
      for (const item of data.streaks) {
        await db.streaks.add(parseDates(item as Record<string, unknown>) as never);
      }
      for (const item of data.badges) {
        await db.badges.add(parseDates(item as Record<string, unknown>) as never);
      }
    }
  );
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.userProfile,
      db.fastingSessions,
      db.mealLogs,
      db.hydrationEntries,
      db.streaks,
      db.badges,
    ],
    async () => {
      await db.userProfile.clear();
      await db.fastingSessions.clear();
      await db.mealLogs.clear();
      await db.hydrationEntries.clear();
      await db.streaks.clear();
      await db.badges.clear();
    }
  );
}

function parseDates(obj: Record<string, unknown>): Record<string, unknown> {
  const result = { ...obj };
  delete result.id;
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      result[key] = new Date(val);
    }
  }
  return result;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/db/database.test.ts`
Expected: All 9 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/db/export-import.ts src/db/database.test.ts
git commit -m "feat: add data export, import, and clear utilities"
```

---

## Task 6: Shared UI Components (ProgressRing, TabBar, Toast, ConfirmDialog)

**Files:**
- Create: `openfast/src/components/ProgressRing.tsx`
- Create: `openfast/src/components/ProgressRing.test.tsx`
- Create: `openfast/src/components/TabBar.tsx`
- Create: `openfast/src/components/TabBar.test.tsx`
- Create: `openfast/src/components/Toast.tsx`
- Create: `openfast/src/components/Toast.test.tsx`
- Create: `openfast/src/components/ConfirmDialog.tsx`

- [ ] **Step 1: Write failing test for ProgressRing**

Create `openfast/src/components/ProgressRing.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing } from "./ProgressRing";

describe("ProgressRing", () => {
  it("renders elapsed time", () => {
    render(<ProgressRing elapsedMs={43_473_000} targetMs={57_600_000} />);
    expect(screen.getByText("12:04:33")).toBeInTheDocument();
  });

  it("renders target time", () => {
    render(<ProgressRing elapsedMs={0} targetMs={57_600_000} />);
    expect(screen.getByText("of 16:00:00")).toBeInTheDocument();
  });

  it("shows goal reached state", () => {
    render(<ProgressRing elapsedMs={60_000_000} targetMs={57_600_000} />);
    expect(screen.getByText("Goal Reached!")).toBeInTheDocument();
  });

  it("has accessible role", () => {
    render(<ProgressRing elapsedMs={0} targetMs={57_600_000} />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd openfast && npx vitest run src/components/ProgressRing.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ProgressRing**

Create `openfast/src/components/ProgressRing.tsx`:

```tsx
import { formatDuration } from "../utils/time";

interface ProgressRingProps {
  elapsedMs: number;
  targetMs: number;
  size?: number;
}

export function ProgressRing({
  elapsedMs,
  targetMs,
  size = 200,
}: ProgressRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = targetMs > 0 ? Math.min(elapsedMs / targetMs, 1) : 0;
  const offset = circumference * (1 - progress);
  const goalReached = elapsedMs >= targetMs && targetMs > 0;
  const strokeColor = goalReached ? "#4ade80" : "#818cf8";
  const center = size / 2;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Fasting progress"
      className="relative inline-flex items-center justify-center"
    >
      <svg width={size} height={size}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#2a2a4a"
          strokeWidth={8}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {goalReached && (
          <span className="text-green-400 text-sm font-semibold mb-1">
            Goal Reached!
          </span>
        )}
        <span className="text-3xl font-bold tracking-wide">
          {formatDuration(elapsedMs)}
        </span>
        <span className="text-sm text-gray-500 mt-1">
          of {formatDuration(targetMs)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run ProgressRing tests**

Run: `cd openfast && npx vitest run src/components/ProgressRing.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Write failing test for TabBar**

Create `openfast/src/components/TabBar.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TabBar } from "./TabBar";

function renderWithRouter(activeTab = "/") {
  return render(
    <MemoryRouter initialEntries={[activeTab]}>
      <TabBar />
    </MemoryRouter>
  );
}

describe("TabBar", () => {
  it("renders 5 tabs", () => {
    renderWithRouter();
    expect(screen.getByText("Timer")).toBeInTheDocument();
    expect(screen.getByText("Log")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithRouter();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `cd openfast && npx vitest run src/components/TabBar.test.tsx`
Expected: FAIL

- [ ] **Step 7: Implement TabBar**

Create `openfast/src/components/TabBar.tsx`:

```tsx
import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "Timer", icon: "⏱" },
  { to: "/log", label: "Log", icon: "📋" },
  { to: "/hydration", label: "Water", icon: "💧" },
  { to: "/progress", label: "Progress", icon: "📊" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export function TabBar() {
  return (
    <nav className="flex justify-around border-t border-navy-700 bg-navy-900 py-3 shrink-0">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center min-w-[44px] min-h-[44px] justify-center text-xs ${
              isActive ? "text-indigo-400" : "text-gray-500"
            }`
          }
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="mt-0.5">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 8: Run TabBar tests**

Run: `cd openfast && npx vitest run src/components/TabBar.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 9: Write failing test for Toast**

Create `openfast/src/components/Toast.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders message when visible", () => {
    render(<Toast message="Badge earned!" visible={true} />);
    expect(screen.getByText("Badge earned!")).toBeInTheDocument();
  });

  it("is hidden when not visible", () => {
    render(<Toast message="Badge earned!" visible={false} />);
    const el = screen.getByText("Badge earned!");
    expect(el.closest("div")).toHaveClass("opacity-0");
  });
});
```

- [ ] **Step 10: Implement Toast**

Create `openfast/src/components/Toast.tsx`:

```tsx
interface ToastProps {
  message: string;
  visible: boolean;
  onDone?: () => void;
}

export function Toast({ message, visible, onDone }: ToastProps) {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-indigo-500 text-white font-semibold shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
      onTransitionEnd={() => {
        if (!visible && onDone) onDone();
      }}
    >
      {message}
    </div>
  );
}
```

- [ ] **Step 11: Run Toast tests**

Run: `cd openfast && npx vitest run src/components/Toast.test.tsx`
Expected: All 2 tests PASS

- [ ] **Step 12: Implement ConfirmDialog (no test — thin UI wrapper)**

Create `openfast/src/components/ConfirmDialog.tsx`:

```tsx
interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmValue?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmValue,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-navy-800 rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{message}</p>
        {confirmValue && (
          <input
            id="confirm-input"
            type="text"
            placeholder={`Type "${confirmValue}" to confirm`}
            className="w-full bg-navy-900 border border-navy-700 rounded-lg px-3 py-2 text-sm mb-4 text-white placeholder-gray-600"
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-navy-700 text-sm font-medium min-h-[44px]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (confirmValue) {
                const input = document.getElementById(
                  "confirm-input"
                ) as HTMLInputElement;
                if (input?.value !== confirmValue) return;
              }
              onConfirm();
            }}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-sm font-medium min-h-[44px]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 13: Commit**

```bash
cd openfast && git add src/components/
git commit -m "feat: add shared UI components (ProgressRing, TabBar, Toast, ConfirmDialog)"
```

---

## Task 7: Fasting Timer Hook

**Files:**
- Create: `openfast/src/hooks/useFastingTimer.ts`
- Create: `openfast/src/hooks/useFastingTimer.test.ts`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/hooks/useFastingTimer.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../db/database";
import {
  startFast,
  endFast,
  getActiveFast,
  cancelFast,
} from "./useFastingTimer";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

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
    await expect(startFast("16:8")).rejects.toThrow(
      "A fast is already active"
    );
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
    const active = await getActiveFast();
    expect(active).toBeUndefined();
  });

  it("returns the active fast", async () => {
    await startFast("18:6");
    const active = await getActiveFast();
    expect(active).toBeDefined();
    expect(active!.protocol).toBe("18:6");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/hooks/useFastingTimer.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement fasting timer functions**

Create `openfast/src/hooks/useFastingTimer.ts`:

```typescript
import { db } from "../db/database";
import { getTargetDurationMs } from "../utils/protocols";
import type { FastingSession } from "../types";

export async function startFast(protocolId: string): Promise<number> {
  const existing = await getActiveFast();
  if (existing) {
    throw new Error("A fast is already active");
  }

  const id = await db.fastingSessions.add({
    startTime: new Date(),
    protocol: protocolId,
    targetDurationMs: getTargetDurationMs(protocolId),
    status: "active",
  });

  return id as number;
}

export async function endFast(sessionId: number): Promise<void> {
  await db.fastingSessions.update(sessionId, {
    endTime: new Date(),
    status: "completed",
  });
}

export async function cancelFast(sessionId: number): Promise<void> {
  await db.fastingSessions.update(sessionId, {
    endTime: new Date(),
    status: "cancelled",
  });
}

export async function getActiveFast(): Promise<FastingSession | undefined> {
  return db.fastingSessions.where("status").equals("active").first();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/hooks/useFastingTimer.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/hooks/useFastingTimer.ts src/hooks/useFastingTimer.test.ts
git commit -m "feat: add fasting timer start/end/cancel logic"
```

---

## Task 8: Streak Evaluation Logic

**Files:**
- Create: `openfast/src/hooks/useStreaks.ts`
- Create: `openfast/src/hooks/useStreaks.test.ts`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/hooks/useStreaks.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/database";
import {
  evaluateFastingStreak,
  evaluateHydrationStreak,
  getStreak,
} from "./useStreaks";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("evaluateFastingStreak", () => {
  it("starts a streak on first completed fast that meets target", async () => {
    const now = new Date(2026, 3, 4, 14, 0);
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 3, 20, 0),
      endTime: now,
      protocol: "16:8",
      targetDurationMs: 16 * 60 * 60 * 1000,
      status: "completed",
    });

    await evaluateFastingStreak(now);
    const streak = await getStreak("fasting");
    expect(streak).toBeDefined();
    expect(streak!.currentCount).toBe(1);
  });

  it("increments streak for consecutive days", async () => {
    // Day 1
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 3, 20, 0),
      endTime: new Date(2026, 3, 4, 12, 0),
      protocol: "16:8",
      targetDurationMs: 16 * 60 * 60 * 1000,
      status: "completed",
    });
    await evaluateFastingStreak(new Date(2026, 3, 4, 12, 0));

    // Day 2
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 4, 20, 0),
      endTime: new Date(2026, 3, 5, 12, 0),
      protocol: "16:8",
      targetDurationMs: 16 * 60 * 60 * 1000,
      status: "completed",
    });
    await evaluateFastingStreak(new Date(2026, 3, 5, 12, 0));

    const streak = await getStreak("fasting");
    expect(streak!.currentCount).toBe(2);
    expect(streak!.longestCount).toBe(2);
  });

  it("does not increment for a fast shorter than target", async () => {
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 4, 6, 0),
      endTime: new Date(2026, 3, 4, 10, 0), // only 4h
      protocol: "16:8",
      targetDurationMs: 16 * 60 * 60 * 1000,
      status: "completed",
    });

    await evaluateFastingStreak(new Date(2026, 3, 4, 10, 0));
    const streak = await getStreak("fasting");
    expect(streak).toBeUndefined();
  });
});

describe("evaluateHydrationStreak", () => {
  it("starts a streak when daily goal is met", async () => {
    const today = new Date(2026, 3, 4);
    await db.userProfile.add({
      selectedProtocol: "16:8",
      dailyWaterGoalMl: 2500,
      createdAt: new Date(),
    });
    await db.hydrationEntries.add({
      timestamp: new Date(2026, 3, 4, 9, 0),
      amountMl: 2500,
    });

    await evaluateHydrationStreak(today);
    const streak = await getStreak("hydration");
    expect(streak).toBeDefined();
    expect(streak!.currentCount).toBe(1);
  });

  it("does not start streak when goal is not met", async () => {
    const today = new Date(2026, 3, 4);
    await db.userProfile.add({
      selectedProtocol: "16:8",
      dailyWaterGoalMl: 2500,
      createdAt: new Date(),
    });
    await db.hydrationEntries.add({
      timestamp: new Date(2026, 3, 4, 9, 0),
      amountMl: 500,
    });

    await evaluateHydrationStreak(today);
    const streak = await getStreak("hydration");
    expect(streak).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/hooks/useStreaks.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement streak evaluation**

Create `openfast/src/hooks/useStreaks.ts`:

```typescript
import { db } from "../db/database";
import type { Streak, StreakType } from "../types";
import { getStartOfDay, getEndOfDay, isSameDay } from "../utils/time";

export async function getStreak(
  type: StreakType
): Promise<Streak | undefined> {
  return db.streaks.where("type").equals(type).first();
}

export async function evaluateFastingStreak(
  completedAt: Date
): Promise<void> {
  const today = getStartOfDay(completedAt);
  const todayEnd = getEndOfDay(completedAt);

  // Find completed fasts ending today that met their target
  const todayFasts = await db.fastingSessions
    .where("startTime")
    .between(
      new Date(today.getTime() - 24 * 60 * 60 * 1000),
      todayEnd,
      true,
      true
    )
    .filter((s) => {
      if (s.status !== "completed" || !s.endTime) return false;
      const duration = s.endTime.getTime() - s.startTime.getTime();
      return duration >= s.targetDurationMs && s.targetDurationMs > 0;
    })
    .toArray();

  if (todayFasts.length === 0) return;

  await updateStreak("fasting", completedAt);
}

export async function evaluateHydrationStreak(date: Date): Promise<void> {
  const profile = await db.userProfile.toCollection().first();
  if (!profile) return;

  const dayStart = getStartOfDay(date);
  const dayEnd = getEndOfDay(date);

  const entries = await db.hydrationEntries
    .where("timestamp")
    .between(dayStart, dayEnd, true, true)
    .toArray();

  const total = entries.reduce((sum, e) => sum + e.amountMl, 0);
  if (total < profile.dailyWaterGoalMl) return;

  await updateStreak("hydration", date);
}

async function updateStreak(type: StreakType, date: Date): Promise<void> {
  const existing = await getStreak(type);
  const today = getStartOfDay(date);

  if (!existing) {
    await db.streaks.add({
      type,
      currentCount: 1,
      longestCount: 1,
      lastCompletedDate: today,
    });
    return;
  }

  if (isSameDay(existing.lastCompletedDate, today)) {
    return; // Already counted today
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isConsecutive = isSameDay(
    existing.lastCompletedDate,
    yesterday
  );

  const newCount = isConsecutive ? existing.currentCount + 1 : 1;
  const newLongest = Math.max(newCount, existing.longestCount);

  await db.streaks.where("type").equals(type).modify({
    currentCount: newCount,
    longestCount: newLongest,
    lastCompletedDate: today,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/hooks/useStreaks.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/hooks/useStreaks.ts src/hooks/useStreaks.test.ts
git commit -m "feat: add fasting and hydration streak evaluation"
```

---

## Task 9: Badge Evaluation Logic

**Files:**
- Create: `openfast/src/hooks/useBadges.ts`
- Create: `openfast/src/hooks/useBadges.test.ts`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/hooks/useBadges.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/database";
import { evaluateBadges, BADGE_DEFINITIONS } from "./useBadges";
import type { BadgeType } from "../types";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("BADGE_DEFINITIONS", () => {
  it("defines 9 badges", () => {
    expect(BADGE_DEFINITIONS).toHaveLength(9);
  });
});

describe("evaluateBadges", () => {
  it("awards first_fast badge after 1 completed fast", async () => {
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 3, 20, 0),
      endTime: new Date(2026, 3, 4, 12, 0),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
    });

    const newBadges = await evaluateBadges();
    const types = newBadges.map((b) => b.type);
    expect(types).toContain("first_fast");
  });

  it("does not award the same badge twice", async () => {
    await db.fastingSessions.add({
      startTime: new Date(),
      endTime: new Date(),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
    });

    await evaluateBadges();
    const secondRun = await evaluateBadges();
    expect(secondRun).toHaveLength(0);
  });

  it("awards extended badge for 20h+ fast", async () => {
    const start = new Date(2026, 3, 3, 12, 0);
    const end = new Date(2026, 3, 4, 9, 0); // 21 hours
    await db.fastingSessions.add({
      startTime: start,
      endTime: end,
      protocol: "20:4",
      targetDurationMs: 20 * 60 * 60 * 1000,
      status: "completed",
    });

    const newBadges = await evaluateBadges();
    const types = newBadges.map((b) => b.type);
    expect(types).toContain("extended");
  });

  it("awards early_bird for fast started before 8 PM", async () => {
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 4, 19, 0), // 7 PM
      endTime: new Date(2026, 3, 5, 11, 0),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
    });

    const newBadges = await evaluateBadges();
    const types = newBadges.map((b) => b.type);
    expect(types).toContain("early_bird");
  });

  it("awards protocol_explorer for 3 different protocols", async () => {
    for (const proto of ["16:8", "18:6", "20:4"]) {
      await db.fastingSessions.add({
        startTime: new Date(),
        endTime: new Date(),
        protocol: proto,
        targetDurationMs: 57_600_000,
        status: "completed",
      });
    }

    const newBadges = await evaluateBadges();
    const types = newBadges.map((b) => b.type);
    expect(types).toContain("protocol_explorer");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/hooks/useBadges.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement badge evaluation**

Create `openfast/src/hooks/useBadges.ts`:

```typescript
import { db } from "../db/database";
import type { Badge, BadgeType } from "../types";

interface BadgeDefinition {
  type: BadgeType;
  name: string;
  icon: string;
  description: string;
  check: () => Promise<boolean>;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: "first_fast",
    name: "First Fast",
    icon: "⚡",
    description: "Complete 1 fast",
    check: async () => {
      const count = await db.fastingSessions
        .where("status")
        .equals("completed")
        .count();
      return count >= 1;
    },
  },
  {
    type: "week_warrior",
    name: "Week Warrior",
    icon: "🔥",
    description: "7-day fasting streak",
    check: async () => {
      const streak = await db.streaks.where("type").equals("fasting").first();
      return streak ? streak.longestCount >= 7 : false;
    },
  },
  {
    type: "month_master",
    name: "Month Master",
    icon: "🏆",
    description: "30-day fasting streak",
    check: async () => {
      const streak = await db.streaks.where("type").equals("fasting").first();
      return streak ? streak.longestCount >= 30 : false;
    },
  },
  {
    type: "century",
    name: "Century",
    icon: "💯",
    description: "100 total completed fasts",
    check: async () => {
      const count = await db.fastingSessions
        .where("status")
        .equals("completed")
        .count();
      return count >= 100;
    },
  },
  {
    type: "hydro_start",
    name: "Hydro Start",
    icon: "���",
    description: "Meet hydration goal for the first time",
    check: async () => {
      const streak = await db.streaks
        .where("type")
        .equals("hydration")
        .first();
      return streak ? streak.longestCount >= 1 : false;
    },
  },
  {
    type: "hydro_habit",
    name: "Hydro Habit",
    icon: "🌊",
    description: "7-day hydration streak",
    check: async () => {
      const streak = await db.streaks
        .where("type")
        .equals("hydration")
        .first();
      return streak ? streak.longestCount >= 7 : false;
    },
  },
  {
    type: "extended",
    name: "Extended",
    icon: "💪",
    description: "Complete a 20h+ fast",
    check: async () => {
      const fasts = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      return fasts.some((f) => {
        if (!f.endTime) return false;
        const duration = f.endTime.getTime() - f.startTime.getTime();
        return duration >= 20 * 60 * 60 * 1000;
      });
    },
  },
  {
    type: "early_bird",
    name: "Early Bird",
    icon: "🌅",
    description: "Start a fast before 8 PM",
    check: async () => {
      const fasts = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      return fasts.some((f) => f.startTime.getHours() < 20);
    },
  },
  {
    type: "protocol_explorer",
    name: "Protocol Explorer",
    icon: "🧪",
    description: "Complete fasts with 3 different protocols",
    check: async () => {
      const fasts = await db.fastingSessions
        .where("status")
        .equals("completed")
        .toArray();
      const protocols = new Set(fasts.map((f) => f.protocol));
      return protocols.size >= 3;
    },
  },
];

export async function evaluateBadges(): Promise<Badge[]> {
  const earnedTypes = new Set(
    (await db.badges.toArray()).map((b) => b.type)
  );

  const newBadges: Badge[] = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earnedTypes.has(def.type)) continue;

    const earned = await def.check();
    if (earned) {
      const badge: Badge = {
        type: def.type,
        name: def.name,
        description: def.description,
        earnedAt: new Date(),
      };
      await db.badges.add(badge);
      newBadges.push(badge);
    }
  }

  return newBadges;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/hooks/useBadges.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/hooks/useBadges.ts src/hooks/useBadges.test.ts
git commit -m "feat: add badge evaluation with 9 badge definitions"
```

---

## Task 10: Notification Utilities

**Files:**
- Create: `openfast/src/utils/notifications.ts`
- Create: `openfast/src/utils/notifications.test.ts`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/utils/notifications.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestPermission,
  sendNotification,
  isSupported,
} from "./notifications";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("isSupported", () => {
  it("returns true when Notification API exists", () => {
    vi.stubGlobal("Notification", { permission: "default" });
    expect(isSupported()).toBe(true);
  });

  it("returns false when Notification API is missing", () => {
    vi.stubGlobal("Notification", undefined);
    expect(isSupported()).toBe(false);
  });
});

describe("requestPermission", () => {
  it("returns granted when user accepts", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });
    const result = await requestPermission();
    expect(result).toBe("granted");
  });
});

describe("sendNotification", () => {
  it("creates a Notification when permission is granted", () => {
    const mockConstructor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(mockConstructor, {
      permission: "granted",
    }));

    sendNotification("Test title", "Test body");
    expect(mockConstructor).toHaveBeenCalledWith("Test title", {
      body: "Test body",
      icon: "/icons/icon-192.png",
    });
  });

  it("does nothing when permission is not granted", () => {
    const mockConstructor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(mockConstructor, {
      permission: "denied",
    }));

    sendNotification("Test", "Body");
    expect(mockConstructor).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/utils/notifications.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement notification utilities**

Create `openfast/src/utils/notifications.ts`:

```typescript
export function isSupported(): boolean {
  return typeof Notification !== "undefined";
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied";
  return Notification.requestPermission();
}

export function sendNotification(title: string, body: string): void {
  if (!isSupported()) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body, icon: "/icons/icon-192.png" });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/utils/notifications.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/utils/notifications.ts src/utils/notifications.test.ts
git commit -m "feat: add browser notification utility wrapper"
```

---

## Task 11: Timer Screen

**Files:**
- Create: `openfast/src/screens/Timer/TimerScreen.tsx`
- Create: `openfast/src/screens/Timer/TimerScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/screens/Timer/TimerScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimerScreen } from "./TimerScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.userProfile.add({
    selectedProtocol: "16:8",
    dailyWaterGoalMl: 2500,
    createdAt: new Date(),
  });
});

describe("TimerScreen", () => {
  it("shows idle state with Start Fast button", async () => {
    render(<TimerScreen />);
    expect(
      await screen.findByRole("button", { name: /start fast/i })
    ).toBeInTheDocument();
  });

  it("shows the selected protocol", async () => {
    render(<TimerScreen />);
    expect(await screen.findByText(/16:8 Protocol/i)).toBeInTheDocument();
  });

  it("starts a fast when button is clicked", async () => {
    const user = userEvent.setup();
    render(<TimerScreen />);

    const btn = await screen.findByRole("button", { name: /start fast/i });
    await user.click(btn);

    expect(
      await screen.findByRole("button", { name: /end fast/i })
    ).toBeInTheDocument();
  });

  it("shows progress ring when fast is active", async () => {
    const user = userEvent.setup();
    render(<TimerScreen />);

    const btn = await screen.findByRole("button", { name: /start fast/i });
    await user.click(btn);

    expect(await screen.findByRole("progressbar")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd openfast && npx vitest run src/screens/Timer/TimerScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement TimerScreen**

Create `openfast/src/screens/Timer/TimerScreen.tsx`:

```tsx
import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { ProgressRing } from "../../components/ProgressRing";
import {
  startFast,
  endFast,
  getActiveFast,
} from "../../hooks/useFastingTimer";
import { evaluateFastingStreak, getStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";
import { getProtocol } from "../../utils/protocols";
import { sendNotification } from "../../utils/notifications";
import { formatTime } from "../../utils/time";
import type { FastingSession, UserProfile } from "../../types";

export function TimerScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeFast, setActiveFast] = useState<FastingSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadState = useCallback(async () => {
    const p = await db.userProfile.toCollection().first();
    setProfile(p ?? null);

    const fast = await getActiveFast();
    setActiveFast(fast ?? null);

    const streak = await getStreak("fasting");
    setStreakCount(streak?.currentCount ?? 0);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    if (!activeFast) {
      setElapsedMs(0);
      return;
    }

    const tick = () => {
      const elapsed = Date.now() - activeFast.startTime.getTime();
      setElapsedMs(elapsed);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeFast]);

  // Notify when goal reached
  useEffect(() => {
    if (
      activeFast &&
      activeFast.targetDurationMs > 0 &&
      elapsedMs >= activeFast.targetDurationMs &&
      elapsedMs - 1000 < activeFast.targetDurationMs
    ) {
      sendNotification(
        "Goal Reached!",
        `You've hit your ${activeFast.protocol} fasting goal.`
      );
    }
  }, [elapsedMs, activeFast]);

  const handleStart = async () => {
    if (!profile) return;
    await startFast(profile.selectedProtocol);
    await loadState();
  };

  const handleEnd = async () => {
    if (!activeFast?.id) return;
    await endFast(activeFast.id);
    await evaluateFastingStreak(new Date());
    await evaluateBadges();
    await loadState();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const protocol = profile ? getProtocol(profile.selectedProtocol) : null;
  const targetMs = activeFast?.targetDurationMs ?? 0;
  const percentage = targetMs > 0 ? Math.min(Math.round((elapsedMs / targetMs) * 100), 100) : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800 px-6 py-8">
      {/* Protocol badge */}
      {protocol && (
        <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1 rounded-full text-sm mb-6">
          {protocol.name} Protocol
        </span>
      )}

      {/* Progress ring or empty state */}
      <ProgressRing
        elapsedMs={activeFast ? elapsedMs : 0}
        targetMs={targetMs}
      />

      {/* Status info */}
      {activeFast && (
        <div className="mt-4 text-center">
          <div className="text-green-400 text-sm font-medium">
            {percentage}% complete
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Started at {formatTime(activeFast.startTime)}
          </div>
        </div>
      )}

      {/* Action button */}
      <div className="mt-8">
        {activeFast ? (
          <button
            onClick={handleEnd}
            className="bg-red-500 text-white px-10 py-3 rounded-3xl font-semibold text-lg min-h-[44px] active:scale-95 transition-transform"
          >
            End Fast
          </button>
        ) : (
          <button
            onClick={handleStart}
            className="bg-indigo-500 text-white px-10 py-3 rounded-3xl font-semibold text-lg min-h-[44px] active:scale-95 transition-transform"
          >
            Start Fast
          </button>
        )}
      </div>

      {/* Streak */}
      <div className="mt-6 pt-4 border-t border-navy-700 w-full max-w-xs text-center">
        <span className="text-gray-500 text-sm">
          🔥 {streakCount} day streak
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/screens/Timer/TimerScreen.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/screens/Timer/
git commit -m "feat: add Timer screen with progress ring and start/end fast"
```

---

## Task 12: Meal Log Screen

**Files:**
- Create: `openfast/src/screens/MealLog/MealLogScreen.tsx`
- Create: `openfast/src/screens/MealLog/MealLogScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/screens/MealLog/MealLogScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MealLogScreen } from "./MealLogScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("MealLogScreen", () => {
  it("shows today header and log meal button", async () => {
    render(<MealLogScreen />);
    expect(await screen.findByText("Today")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /log meal/i })
    ).toBeInTheDocument();
  });

  it("shows existing meals for today", async () => {
    await db.mealLogs.add({
      timestamp: new Date(),
      description: "Grilled chicken salad",
    });

    render(<MealLogScreen />);
    expect(
      await screen.findByText("Grilled chicken salad")
    ).toBeInTheDocument();
  });

  it("adds a new meal via modal", async () => {
    const user = userEvent.setup();
    render(<MealLogScreen />);

    await user.click(
      await screen.findByRole("button", { name: /log meal/i })
    );

    const input = screen.getByPlaceholderText(/what did you eat/i);
    await user.type(input, "Salmon and rice");
    await user.click(screen.getByRole("button", { name: /save/i }));

    expect(await screen.findByText("Salmon and rice")).toBeInTheDocument();
  });

  it("deletes a meal", async () => {
    await db.mealLogs.add({
      timestamp: new Date(),
      description: "Remove me",
    });

    const user = userEvent.setup();
    render(<MealLogScreen />);

    expect(await screen.findByText("Remove me")).toBeInTheDocument();

    const deleteBtn = await screen.findByRole("button", { name: /delete/i });
    await user.click(deleteBtn);

    expect(screen.queryByText("Remove me")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd openfast && npx vitest run src/screens/MealLog/MealLogScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement MealLogScreen**

Create `openfast/src/screens/MealLog/MealLogScreen.tsx`:

```tsx
import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { getStartOfDay, getEndOfDay, formatTime } from "../../utils/time";
import type { MealLog } from "../../types";

export function MealLogScreen() {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newMealText, setNewMealText] = useState("");

  const loadMeals = useCallback(async () => {
    const start = getStartOfDay(selectedDate);
    const end = getEndOfDay(selectedDate);
    const results = await db.mealLogs
      .where("timestamp")
      .between(start, end, true, true)
      .sortBy("timestamp");
    setMeals(results);
  }, [selectedDate]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const handleSave = async () => {
    if (!newMealText.trim()) return;
    await db.mealLogs.add({
      timestamp: new Date(),
      description: newMealText.trim(),
    });
    setNewMealText("");
    setShowModal(false);
    await loadMeals();
  };

  const handleDelete = async (id: number) => {
    await db.mealLogs.delete(id);
    await loadMeals();
  };

  const shiftDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    setSelectedDate(next);
  };

  const dateLabel = isToday(selectedDate)
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  return (
    <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-6 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{dateLabel}</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-semibold min-h-[44px]"
        >
          + Log Meal
        </button>
      </div>

      {/* Meal list */}
      <div className="flex flex-col gap-2">
        {meals.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-8">
            No meals logged
          </div>
        )}
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{meal.description}</span>
              <span className="text-gray-500 text-sm ml-3">
                {formatTime(meal.timestamp)}
              </span>
            </div>
            <button
              onClick={() => handleDelete(meal.id!)}
              aria-label="delete"
              className="text-red-400 text-sm min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Date nav */}
      <div className="flex justify-center gap-6 mt-6 text-sm">
        <button
          onClick={() => shiftDate(-1)}
          className="text-gray-500 min-h-[44px]"
        >
          ← Yesterday
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="text-indigo-400 min-h-[44px]"
        >
          Today
        </button>
        <button
          onClick={() => shiftDate(1)}
          className="text-gray-500 min-h-[44px]"
        >
          Tomorrow →
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="bg-navy-800 rounded-xl p-6 w-full max-w-sm mb-4">
            <h3 className="text-lg font-semibold mb-4">Log a Meal</h3>
            <input
              type="text"
              value={newMealText}
              onChange={(e) => setNewMealText(e.target.value)}
              placeholder="What did you eat?"
              className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewMealText("");
                }}
                className="flex-1 py-2.5 rounded-xl bg-navy-700 text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-sm font-medium min-h-[44px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/screens/MealLog/MealLogScreen.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/screens/MealLog/
git commit -m "feat: add Meal Log screen with add/delete and date navigation"
```

---

## Task 13: Hydration Screen

**Files:**
- Create: `openfast/src/screens/Hydration/HydrationScreen.tsx`
- Create: `openfast/src/screens/Hydration/HydrationScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/screens/Hydration/HydrationScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HydrationScreen } from "./HydrationScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.userProfile.add({
    selectedProtocol: "16:8",
    dailyWaterGoalMl: 2500,
    createdAt: new Date(),
  });
});

describe("HydrationScreen", () => {
  it("shows daily goal", async () => {
    render(<HydrationScreen />);
    expect(await screen.findByText(/2,500 ml/)).toBeInTheDocument();
  });

  it("shows quick-add buttons", async () => {
    render(<HydrationScreen />);
    expect(
      await screen.findByRole("button", { name: /250 ml/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /500 ml/i })
    ).toBeInTheDocument();
  });

  it("adds water on quick-add click", async () => {
    const user = userEvent.setup();
    render(<HydrationScreen />);

    const btn = await screen.findByRole("button", { name: /250 ml/i });
    await user.click(btn);

    expect(await screen.findByText(/250/)).toBeInTheDocument();
  });

  it("shows entry log after adding", async () => {
    await db.hydrationEntries.add({
      timestamp: new Date(),
      amountMl: 500,
    });

    render(<HydrationScreen />);
    expect(await screen.findByText("500 ml")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/screens/Hydration/HydrationScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement HydrationScreen**

Create `openfast/src/screens/Hydration/HydrationScreen.tsx`:

```tsx
import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { getStartOfDay, getEndOfDay, formatTime } from "../../utils/time";
import { evaluateHydrationStreak } from "../../hooks/useStreaks";
import { evaluateBadges } from "../../hooks/useBadges";
import type { HydrationEntry, UserProfile } from "../../types";

export function HydrationScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<HydrationEntry[]>([]);
  const [totalMl, setTotalMl] = useState(0);

  const loadData = useCallback(async () => {
    const p = await db.userProfile.toCollection().first();
    setProfile(p ?? null);

    const start = getStartOfDay(new Date());
    const end = getEndOfDay(new Date());
    const todayEntries = await db.hydrationEntries
      .where("timestamp")
      .between(start, end, true, true)
      .sortBy("timestamp");
    setEntries(todayEntries);
    setTotalMl(todayEntries.reduce((sum, e) => sum + e.amountMl, 0));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addWater = async (amountMl: number) => {
    await db.hydrationEntries.add({ timestamp: new Date(), amountMl });
    await evaluateHydrationStreak(new Date());
    await evaluateBadges();
    await loadData();
  };

  const deleteEntry = async (id: number) => {
    await db.hydrationEntries.delete(id);
    await loadData();
  };

  const goal = profile?.dailyWaterGoalMl ?? 2500;
  const dropCount = Math.ceil(goal / 250);
  const filledDrops = Math.min(Math.floor(totalMl / 250), dropCount);

  return (
    <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-6 overflow-y-auto">
      {/* Goal display */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500">Daily Goal</div>
        <div className="text-3xl font-bold text-cyan-400">
          {totalMl.toLocaleString()}{" "}
          <span className="text-base text-gray-500">
            / {goal.toLocaleString()} ml
          </span>
        </div>
      </div>

      {/* Drop grid */}
      <div className="flex justify-center gap-1.5 flex-wrap max-w-[240px] mx-auto mb-6">
        {Array.from({ length: dropCount }, (_, i) => (
          <span
            key={i}
            className="text-2xl"
            style={{ opacity: i < filledDrops ? 1 : 0.3 }}
          >
            💧
          </span>
        ))}
      </div>

      {/* Quick add buttons */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => addWater(250)}
          className="bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px]"
        >
          + 250 ml
        </button>
        <button
          onClick={() => addWater(500)}
          className="bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 px-5 py-2.5 rounded-full text-sm min-h-[44px]"
        >
          + 500 ml
        </button>
      </div>

      {/* Entry log */}
      <div className="space-y-0">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex justify-between items-center py-2 border-b border-navy-700 text-sm"
          >
            <span className="text-gray-500">
              {formatTime(entry.timestamp)}
            </span>
            <div className="flex items-center gap-3">
              <span>{entry.amountMl} ml</span>
              <button
                onClick={() => deleteEntry(entry.id!)}
                aria-label="delete"
                className="text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/screens/Hydration/HydrationScreen.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/screens/Hydration/
git commit -m "feat: add Hydration screen with quick-add and drop grid"
```

---

## Task 14: Progress Screen

**Files:**
- Create: `openfast/src/screens/Progress/ProgressScreen.tsx`
- Create: `openfast/src/screens/Progress/ProgressScreen.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `openfast/src/screens/Progress/ProgressScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressScreen } from "./ProgressScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("ProgressScreen", () => {
  it("shows streak cards", async () => {
    render(<ProgressScreen />);
    expect(await screen.findByText("Fasting Streak")).toBeInTheDocument();
    expect(screen.getByText("Hydration Streak")).toBeInTheDocument();
    expect(screen.getByText("Total Fasts")).toBeInTheDocument();
  });

  it("shows badge section", async () => {
    render(<ProgressScreen />);
    expect(await screen.findByText("Badges")).toBeInTheDocument();
  });

  it("shows earned badges", async () => {
    await db.badges.add({
      type: "first_fast",
      name: "First Fast",
      description: "Complete 1 fast",
      earnedAt: new Date(),
    });

    render(<ProgressScreen />);
    expect(await screen.findByText("First Fast")).toBeInTheDocument();
  });

  it("shows fasting history", async () => {
    await db.fastingSessions.add({
      startTime: new Date(2026, 3, 4, 20, 0),
      endTime: new Date(2026, 3, 5, 12, 0),
      protocol: "16:8",
      targetDurationMs: 57_600_000,
      status: "completed",
    });

    render(<ProgressScreen />);
    expect(await screen.findByText("History")).toBeInTheDocument();
    expect(await screen.findByText(/16:8/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/screens/Progress/ProgressScreen.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement ProgressScreen**

Create `openfast/src/screens/Progress/ProgressScreen.tsx`:

```tsx
import { useState, useEffect, useCallback } from "react";
import { db } from "../../db/database";
import { BADGE_DEFINITIONS } from "../../hooks/useBadges";
import { formatDuration } from "../../utils/time";
import type { Badge, FastingSession, Streak } from "../../types";

export function ProgressScreen() {
  const [fastingStreak, setFastingStreak] = useState(0);
  const [hydrationStreak, setHydrationStreak] = useState(0);
  const [totalFasts, setTotalFasts] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [history, setHistory] = useState<FastingSession[]>([]);

  const loadData = useCallback(async () => {
    const fStreak = await db.streaks.where("type").equals("fasting").first();
    setFastingStreak(fStreak?.currentCount ?? 0);

    const hStreak = await db.streaks.where("type").equals("hydration").first();
    setHydrationStreak(hStreak?.currentCount ?? 0);

    const count = await db.fastingSessions
      .where("status")
      .equals("completed")
      .count();
    setTotalFasts(count);

    const badges = await db.badges.toArray();
    setEarnedBadges(badges);

    const sessions = await db.fastingSessions
      .where("status")
      .equals("completed")
      .reverse()
      .sortBy("startTime");
    setHistory(sessions.slice(0, 20));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const earnedTypes = new Set(earnedBadges.map((b) => b.type));

  return (
    <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-6 overflow-y-auto">
      {/* Stats row */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">
            {fastingStreak}
          </div>
          <div className="text-xs text-gray-500">Fasting Streak</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {hydrationStreak}
          </div>
          <div className="text-xs text-gray-500">Hydration Streak</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">
            {totalFasts}
          </div>
          <div className="text-xs text-gray-500">Total Fasts</div>
        </div>
      </div>

      {/* Weekly calendar */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">This Week</h3>
        <WeeklyCalendar />
      </div>

      {/* Badges */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Badges</h3>
        <div className="flex gap-3 flex-wrap">
          {BADGE_DEFINITIONS.map((def) => {
            const earned = earnedTypes.has(def.type);
            return (
              <div
                key={def.type}
                className={`bg-white/5 rounded-xl p-3 text-center w-20 ${
                  earned ? "" : "opacity-40 border border-dashed border-gray-600"
                }`}
              >
                <div className="text-2xl">{def.icon}</div>
                <div className="text-xs text-gray-400 mt-1">{def.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-medium mb-3">History</h3>
        {history.length === 0 && (
          <div className="text-gray-500 text-sm text-center py-4">
            No completed fasts yet
          </div>
        )}
        <div className="flex flex-col gap-2">
          {history.map((fast) => {
            const duration = fast.endTime
              ? fast.endTime.getTime() - fast.startTime.getTime()
              : 0;
            return (
              <div
                key={fast.id}
                className="bg-white/5 rounded-xl p-3 flex justify-between items-center text-sm"
              >
                <div>
                  <span className="font-medium">{fast.protocol}</span>
                  <span className="text-gray-500 ml-2">
                    {fast.startTime.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span className="text-gray-400">
                  {formatDuration(duration)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeeklyCalendar() {
  const [dayStatuses, setDayStatuses] = useState<
    ("completed" | "active" | "none")[]
  >(Array(7).fill("none"));

  useEffect(() => {
    async function load() {
      const now = new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      monday.setHours(0, 0, 0, 0);

      const statuses: ("completed" | "active" | "none")[] = [];

      for (let i = 0; i < 7; i++) {
        const dayStart = new Date(monday);
        dayStart.setDate(monday.getDate() + i);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const fasts = await db.fastingSessions
          .where("startTime")
          .between(dayStart, dayEnd, true, true)
          .toArray();

        if (fasts.some((f) => f.status === "completed")) {
          statuses.push("completed");
        } else if (fasts.some((f) => f.status === "active")) {
          statuses.push("active");
        } else {
          statuses.push("none");
        }
      }

      setDayStatuses(statuses);
    }
    load();
  }, []);

  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="flex justify-between">
      {dayLabels.map((label, i) => (
        <div key={i} className="text-center">
          <div className="text-xs text-gray-500">{label}</div>
          <div
            className={`w-8 h-8 rounded-full mt-1 flex items-center justify-center text-xs ${
              dayStatuses[i] === "completed"
                ? "bg-green-500 text-white"
                : dayStatuses[i] === "active"
                ? "bg-indigo-500 text-white"
                : "bg-navy-700"
            }`}
          >
            {dayStatuses[i] === "completed"
              ? "✓"
              : dayStatuses[i] === "active"
              ? "…"
              : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd openfast && npx vitest run src/screens/Progress/ProgressScreen.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/screens/Progress/
git commit -m "feat: add Progress screen with streaks, badges, weekly calendar, history"
```

---

## Task 15: Settings Screen & Tips/Guides

**Files:**
- Create: `openfast/src/screens/Settings/SettingsScreen.tsx`
- Create: `openfast/src/screens/Settings/SettingsScreen.test.tsx`
- Create: `openfast/src/screens/Settings/TipsGuides.tsx`
- Create: `openfast/src/screens/Settings/TipsGuides.test.tsx`
- Create: `openfast/src/content/guides.ts`

- [ ] **Step 1: Create guides content**

Create `openfast/src/content/guides.ts`:

```typescript
export interface Guide {
  id: string;
  category: string;
  title: string;
  body: string;
}

export const GUIDES: Guide[] = [
  {
    id: "getting-started",
    category: "Getting Started",
    title: "What Is Intermittent Fasting?",
    body: "Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. It doesn't specify which foods to eat, but rather when you should eat them. Common methods involve daily 16-hour fasts or fasting for 24 hours twice per week. Fasting has been a practice throughout human evolution, and your body is well-equipped to handle extended periods without food.",
  },
  {
    id: "choosing-protocol",
    category: "Getting Started",
    title: "Choosing Your First Protocol",
    body: "If you're new to fasting, start with 12:12 — 12 hours fasting, 12 hours eating. Most of your fasting happens while you sleep. Once comfortable (usually 1-2 weeks), try 14:10, then 16:8. The 16:8 protocol is the most popular because it balances effectiveness with sustainability. Don't jump straight to advanced protocols like 20:4 or OMAD.",
  },
  {
    id: "protocol-16-8",
    category: "Protocols Explained",
    title: "The 16:8 Protocol",
    body: "Fast for 16 hours, eat within an 8-hour window. Example: stop eating at 8 PM, resume at 12 PM the next day. This is the most researched and widely practiced protocol. Benefits include improved insulin sensitivity, fat burning, and mental clarity. Tips: black coffee and water are fine during the fast. Start by pushing breakfast back gradually.",
  },
  {
    id: "protocol-18-6",
    category: "Protocols Explained",
    title: "The 18:6 Protocol",
    body: "Fast for 18 hours with a 6-hour eating window. Example: eat between 12 PM and 6 PM. This protocol deepens the fasting benefits — your body spends more time in fat-burning mode and autophagy (cellular cleanup) increases. Best for people comfortable with 16:8 who want to go further. Ensure you eat enough calories during your window.",
  },
  {
    id: "protocol-omad",
    category: "Protocols Explained",
    title: "OMAD (One Meal A Day)",
    body: "Eat one large meal per day within a 1-hour window, fasting for 23 hours. This is an advanced protocol — don't start here. Benefits include deep autophagy, simplified meal planning, and strong fat loss. Risks include undereating and nutrient deficiency if your single meal isn't well-planned. Consult a healthcare provider before trying OMAD.",
  },
  {
    id: "hydration-why",
    category: "Hydration",
    title: "Why Hydration Matters During Fasting",
    body: "When fasting, you lose a significant source of water intake — food. Many foods (fruits, vegetables, soups) are 80-90% water. During a fast, you need to compensate by drinking more. Dehydration can cause headaches, fatigue, and dizziness — symptoms often mistakenly attributed to fasting itself. Aim for at least 2-3 liters per day.",
  },
  {
    id: "hydration-signs",
    category: "Hydration",
    title: "Signs of Dehydration",
    body: "Watch for: dark yellow urine, headaches, dry mouth, fatigue, dizziness, or difficulty concentrating. If you experience these during a fast, drink water immediately. A good rule: if you feel hungry during a fast, drink a glass of water first — thirst is often mistaken for hunger.",
  },
  {
    id: "faq-coffee",
    category: "Common Questions",
    title: "Does Coffee Break My Fast?",
    body: "Black coffee does not break your fast. It contains virtually zero calories and may actually enhance some fasting benefits by boosting metabolism. However, adding milk, cream, sugar, or sweeteners does break your fast. Even small amounts of calories can trigger an insulin response. Stick to plain black coffee or herbal tea.",
  },
  {
    id: "faq-exercise",
    category: "Common Questions",
    title: "Can I Exercise While Fasting?",
    body: "Yes, but listen to your body. Light to moderate exercise (walking, yoga, light weights) is generally fine during a fast. High-intensity exercise may be harder, especially when you're new to fasting. If you do intense workouts, consider timing them near the end of your fast or during your eating window. Stay hydrated and stop if you feel dizzy.",
  },
  {
    id: "faq-safety",
    category: "Common Questions",
    title: "Is Fasting Safe for Everyone?",
    body: "Intermittent fasting is safe for most healthy adults. However, it is NOT recommended for: pregnant or breastfeeding women, children and teenagers, people with a history of eating disorders, people with diabetes (without medical supervision), or anyone on medications that require food intake. Always consult your healthcare provider before starting a fasting regimen.",
  },
];

export function getGuidesByCategory(): Map<string, Guide[]> {
  const map = new Map<string, Guide[]>();
  for (const guide of GUIDES) {
    const list = map.get(guide.category) ?? [];
    list.push(guide);
    map.set(guide.category, list);
  }
  return map;
}
```

- [ ] **Step 2: Write failing tests for SettingsScreen**

Create `openfast/src/screens/Settings/SettingsScreen.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { SettingsScreen } from "./SettingsScreen";
import { db } from "../../db/database";

beforeEach(async () => {
  await db.delete();
  await db.open();
  await db.userProfile.add({
    selectedProtocol: "16:8",
    dailyWaterGoalMl: 2500,
    createdAt: new Date(),
  });
});

function renderSettings() {
  return render(
    <MemoryRouter>
      <SettingsScreen />
    </MemoryRouter>
  );
}

describe("SettingsScreen", () => {
  it("shows fasting protocol setting", async () => {
    renderSettings();
    expect(await screen.findByText("Fasting Protocol")).toBeInTheDocument();
    expect(screen.getByText("16:8")).toBeInTheDocument();
  });

  it("shows hydration goal setting", async () => {
    renderSettings();
    expect(
      await screen.findByText("Daily Water Goal")
    ).toBeInTheDocument();
  });

  it("shows data section with export/import/clear", async () => {
    renderSettings();
    expect(await screen.findByText("Export Data")).toBeInTheDocument();
    expect(screen.getByText("Import Data")).toBeInTheDocument();
    expect(screen.getByText("Clear All Data")).toBeInTheDocument();
  });

  it("shows tips & guides link", async () => {
    renderSettings();
    expect(await screen.findByText("Tips & Guides")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd openfast && npx vitest run src/screens/Settings/SettingsScreen.test.tsx`
Expected: FAIL

- [ ] **Step 4: Implement SettingsScreen**

Create `openfast/src/screens/Settings/SettingsScreen.tsx`:

```tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../db/database";
import { PROTOCOLS } from "../../utils/protocols";
import { exportAllData, importAllData, clearAllData } from "../../db/export-import";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { UserProfile } from "../../types";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProtocolPicker, setShowProtocolPicker] = useState(false);
  const [showWaterGoalInput, setShowWaterGoalInput] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [waterGoalText, setWaterGoalText] = useState("");

  const loadProfile = useCallback(async () => {
    const p = await db.userProfile.toCollection().first();
    setProfile(p ?? null);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProtocol = async (protocolId: string) => {
    if (profile?.id) {
      await db.userProfile.update(profile.id, {
        selectedProtocol: protocolId,
      });
    }
    setShowProtocolPicker(false);
    await loadProfile();
  };

  const updateWaterGoal = async () => {
    const goal = parseInt(waterGoalText, 10);
    if (isNaN(goal) || goal <= 0) return;
    if (profile?.id) {
      await db.userProfile.update(profile.id, { dailyWaterGoalMl: goal });
    }
    setShowWaterGoalInput(false);
    setWaterGoalText("");
    await loadProfile();
  };

  const handleExport = async () => {
    const data = await exportAllData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `openfast-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data, "replace");
      await loadProfile();
    };
    input.click();
  };

  const handleClear = async () => {
    await clearAllData();
    setShowClearConfirm(false);
    await loadProfile();
  };

  const row = (label: string, value: string, onClick?: () => void) => (
    <button
      onClick={onClick}
      className="bg-white/5 px-4 py-3.5 flex justify-between items-center w-full text-left min-h-[44px]"
    >
      <span>{label}</span>
      <span className="text-gray-500 text-sm">{value}</span>
    </button>
  );

  return (
    <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-6 overflow-y-auto">
      {/* Fasting */}
      <div className="text-xs text-gray-500 uppercase mb-2 mt-2">Fasting</div>
      <div className="rounded-xl overflow-hidden flex flex-col">
        {row(
          "Fasting Protocol",
          profile?.selectedProtocol ?? "—",
          () => setShowProtocolPicker(true)
        )}
      </div>

      {/* Hydration */}
      <div className="text-xs text-gray-500 uppercase mb-2 mt-6">
        Hydration
      </div>
      <div className="rounded-xl overflow-hidden flex flex-col">
        {row(
          "Daily Water Goal",
          profile ? `${profile.dailyWaterGoalMl.toLocaleString()} ml` : "—",
          () => {
            setWaterGoalText(String(profile?.dailyWaterGoalMl ?? 2500));
            setShowWaterGoalInput(true);
          }
        )}
      </div>

      {/* Data */}
      <div className="text-xs text-gray-500 uppercase mb-2 mt-6">Data</div>
      <div className="rounded-xl overflow-hidden flex flex-col divide-y divide-navy-700">
        {row("Export Data", "JSON", handleExport)}
        {row("Import Data", "›", handleImport)}
        <button
          onClick={() => setShowClearConfirm(true)}
          className="bg-white/5 px-4 py-3.5 flex justify-between items-center w-full text-left min-h-[44px]"
        >
          <span className="text-red-400">Clear All Data</span>
          <span className="text-gray-500 text-sm">›</span>
        </button>
      </div>

      {/* About */}
      <div className="text-xs text-gray-500 uppercase mb-2 mt-6">About</div>
      <div className="rounded-xl overflow-hidden flex flex-col divide-y divide-navy-700">
        {row("Tips & Guides", "›", () => navigate("/settings/guides"))}
        {row("Version", "0.1.0")}
      </div>

      {/* Protocol picker modal */}
      {showProtocolPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="bg-navy-800 rounded-xl p-6 w-full max-w-sm mb-4">
            <h3 className="text-lg font-semibold mb-4">Select Protocol</h3>
            <div className="flex flex-col gap-2">
              {PROTOCOLS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => updateProtocol(p.id)}
                  className={`p-3 rounded-lg text-left min-h-[44px] ${
                    p.id === profile?.selectedProtocol
                      ? "bg-indigo-500/20 border border-indigo-500"
                      : "bg-white/5"
                  }`}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    {p.isWeekly
                      ? "2 fast days/week"
                      : `${p.fastingHours}h fast / ${p.eatingHours}h eat`}
                  </span>
                  <span className="text-gray-600 text-xs ml-2">
                    {p.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Water goal input modal */}
      {showWaterGoalInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-navy-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Daily Water Goal</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                value={waterGoalText}
                onChange={(e) => setWaterGoalText(e.target.value)}
                className="flex-1 bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-white"
                autoFocus
              />
              <span className="text-gray-500">ml</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWaterGoalInput(false)}
                className="flex-1 py-2.5 rounded-xl bg-navy-700 text-sm font-medium min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={updateWaterGoal}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-sm font-medium min-h-[44px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear confirmation */}
      <ConfirmDialog
        open={showClearConfirm}
        title="Clear All Data"
        message="This will permanently delete all your fasting sessions, meals, hydration entries, streaks, and badges."
        confirmLabel="Delete"
        confirmValue="DELETE"
        onConfirm={handleClear}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}
```

- [ ] **Step 5: Run SettingsScreen tests**

Run: `cd openfast && npx vitest run src/screens/Settings/SettingsScreen.test.tsx`
Expected: All 4 tests PASS

- [ ] **Step 6: Write failing test for TipsGuides**

Create `openfast/src/screens/Settings/TipsGuides.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TipsGuides } from "./TipsGuides";

describe("TipsGuides", () => {
  it("shows all categories", () => {
    render(<TipsGuides />);
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.getByText("Protocols Explained")).toBeInTheDocument();
    expect(screen.getByText("Hydration")).toBeInTheDocument();
    expect(screen.getByText("Common Questions")).toBeInTheDocument();
  });

  it("shows guide titles", () => {
    render(<TipsGuides />);
    expect(
      screen.getByText("What Is Intermittent Fasting?")
    ).toBeInTheDocument();
  });

  it("expands guide body on click", async () => {
    const user = userEvent.setup();
    render(<TipsGuides />);

    await user.click(screen.getByText("What Is Intermittent Fasting?"));
    expect(
      screen.getByText(/eating pattern that cycles/)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Implement TipsGuides**

Create `openfast/src/screens/Settings/TipsGuides.tsx`:

```tsx
import { useState } from "react";
import { getGuidesByCategory } from "../../content/guides";

export function TipsGuides() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const categories = getGuidesByCategory();

  return (
    <div className="flex-1 bg-gradient-to-br from-navy-900 to-navy-800 px-4 py-6 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Tips & Guides</h2>

      {Array.from(categories.entries()).map(([category, guides]) => (
        <div key={category} className="mb-6">
          <h3 className="text-xs text-gray-500 uppercase mb-2">
            {category}
          </h3>
          <div className="rounded-xl overflow-hidden flex flex-col divide-y divide-navy-700">
            {guides.map((guide) => (
              <button
                key={guide.id}
                onClick={() =>
                  setExpandedId(expandedId === guide.id ? null : guide.id)
                }
                className="bg-white/5 px-4 py-3.5 text-left w-full min-h-[44px]"
              >
                <div className="font-medium text-sm">{guide.title}</div>
                {expandedId === guide.id && (
                  <div className="text-gray-400 text-sm mt-3 leading-relaxed">
                    {guide.body}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run TipsGuides tests**

Run: `cd openfast && npx vitest run src/screens/Settings/TipsGuides.test.tsx`
Expected: All 3 tests PASS

- [ ] **Step 9: Commit**

```bash
cd openfast && git add src/screens/Settings/ src/content/guides.ts
git commit -m "feat: add Settings screen with protocol picker, data management, and tips/guides"
```

---

## Task 16: App Shell — Router, TabBar, First-Run Setup

**Files:**
- Modify: `openfast/src/App.tsx`
- Modify: `openfast/src/main.tsx`

- [ ] **Step 1: Update App.tsx with router and tab navigation**

Replace `openfast/src/App.tsx` with:

```tsx
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
```

- [ ] **Step 2: Run the full test suite**

Run: `cd openfast && npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Run the dev server and verify manually**

Run: `cd openfast && npm run dev`
Expected: App loads at localhost, shows Timer screen with "Start Fast" button, tab bar visible at bottom

- [ ] **Step 4: Build and verify**

Run: `cd openfast && npm run build`
Expected: Production build succeeds

- [ ] **Step 5: Commit**

```bash
cd openfast && git add src/App.tsx
git commit -m "feat: wire up router, tab bar, and first-run profile setup"
```

---

## Task 17: PWA Assets & Final Polish

**Files:**
- Create: `openfast/public/icons/icon-192.png`
- Create: `openfast/public/icons/icon-512.png`
- Create: `openfast/LICENSE`
- Create: `openfast/README.md`

- [ ] **Step 1: Generate placeholder icons**

Use a simple SVG-to-PNG approach or create minimal placeholder icons:

```bash
cd openfast
# Create a simple SVG icon and convert
cat > /tmp/icon.svg << 'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#0f0f1a"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#818cf8" stroke-width="24"/>
  <circle cx="256" cy="256" r="160" fill="none" stroke="#818cf8" stroke-width="24" stroke-dasharray="1005" stroke-dashoffset="251" stroke-linecap="round" transform="rotate(-90 256 256)"/>
  <text x="256" y="270" text-anchor="middle" fill="white" font-family="system-ui" font-size="120" font-weight="bold">OF</text>
</svg>
SVG
```

Note: For production, proper PNG icons should be generated. For development, the SVG serves as the icon source. If `convert` (ImageMagick) is available:

```bash
convert /tmp/icon.svg -resize 192x192 public/icons/icon-192.png
convert /tmp/icon.svg -resize 512x512 public/icons/icon-512.png
```

If not available, copy the SVG as a placeholder and note that PNGs need to be generated before production release.

- [ ] **Step 2: Create LICENSE**

Create `openfast/LICENSE`:

```
MIT License

Copyright (c) 2026 OpenFast Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 3: Create README.md**

Create `openfast/README.md`:

```markdown
# OpenFast

A privacy-first fasting and wellness tracker. Free, open source, works offline.

All your data stays on your device. No accounts, no servers, no tracking.

## Features

- **Fasting Timer** — Start/stop fasts with a visual progress ring. Supports 16:8, 18:6, 20:4, OMAD, and more.
- **Meal Log** — Simple text-based meal logging tied to your eating window.
- **Hydration Tracking** — Tap to log water intake toward a daily goal.
- **Streaks & Badges** — Stay motivated with consecutive-day streaks and achievement badges.
- **Tips & Guides** — Bundled educational content about fasting, hydration, and common questions.
- **Data Export/Import** — Back up and restore your data as JSON.
- **Installable PWA** — Add to your home screen for a native app experience.

## Quick Start

```bash
git clone <repo-url>
cd openfast
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, Dexie.js (IndexedDB), Workbox PWA

## Contributing

Pull requests welcome. Please open an issue first to discuss changes.

## License

MIT
```

- [ ] **Step 4: Final build verification**

Run: `cd openfast && npm run build && npm run test:run`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Commit**

```bash
cd openfast && git add -A
git commit -m "feat: add PWA icons, LICENSE, and README"
```
