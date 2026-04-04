# OpenFast — Product Requirements Document

An open source, privacy-first fasting and wellness tracking Progressive Web App. A free alternative to Zero Longevity with all data stored locally on-device.

## Problem Statement

Existing fasting apps (Zero, Fastic, etc.) require account creation, store user health data on third-party servers, and gate core features behind subscriptions. Health-conscious users who want to track fasting, hydration, and meals deserve a tool that respects their privacy, works offline, and costs nothing.

## Goals

- Replicate the core UX of Zero Longevity as a mobile-first PWA
- All data stays on-device (IndexedDB) — zero network calls, zero accounts
- Installable from the browser, works fully offline
- Open source (community contributions welcome)

## Non-Goals

- Native app store distribution (PWA only)
- Cloud sync or multi-device sync
- AI-powered meal analysis or calorie/macro tracking
- Social features, leaderboards, or sharing
- Wearable integrations (Apple Watch, Fitbit, etc.)

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18+ with TypeScript | Largest contributor pool, mature ecosystem |
| Build | Vite | Fast DX, modern defaults, PWA plugin available |
| Storage | Dexie.js (IndexedDB) | Purpose-built for IndexedDB, clean typed API |
| Offline/PWA | Workbox (via vite-plugin-pwa) | Industry standard service worker tooling |
| Routing | React Router v6+ | Standard for React SPAs |
| State | React Context + useReducer | App state is simple enough; no Redux needed |
| Styling | Tailwind CSS | Utility-first, fast iteration, widely known among contributors |
| Testing | Vitest + React Testing Library | Native Vite integration, fast |

## Architecture

```
src/
  components/       # Shared UI components (Button, ProgressRing, TabBar, Toast)
  screens/          # One directory per screen (Timer, MealLog, Hydration, Progress, Settings)
  hooks/            # Custom hooks (useFastingTimer, useStreaks, useBadges, useHydration)
  db/               # Dexie database schema, migrations, export/import utilities
  content/          # Static tips & guides (markdown or JSON)
  utils/            # Date/time helpers, notification wrappers
  types/            # Shared TypeScript types
  App.tsx           # Root component with router and tab navigation
  main.tsx          # Entry point
  sw.ts             # Service worker registration
public/
  manifest.json     # PWA manifest
  icons/            # App icons (192x192, 512x512)
```

### Data Model

**UserProfile**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| name | string? | Optional display name |
| selectedProtocol | string | Active fasting protocol (e.g., "16:8") |
| dailyWaterGoalMl | number | Daily hydration target in milliliters |
| createdAt | Date | Account creation timestamp |

**FastingSession**
| Field | Type | Description |
|-------|------|-------------|
| id | string (auto) | Primary key |
| startTime | Date | When the fast began |
| endTime | Date? | When the fast ended (null if active) |
| protocol | string | Protocol used for this fast |
| targetDurationMs | number | Target duration derived from protocol |
| status | enum | "active" \| "completed" \| "cancelled" |
| notes | string? | Optional user notes |

**MealLog**
| Field | Type | Description |
|-------|------|-------------|
| id | string (auto) | Primary key |
| timestamp | Date | When the meal was logged |
| description | string | Free-text meal description |
| fastingSessionId | string? | Optional link to associated eating window |

**HydrationEntry**
| Field | Type | Description |
|-------|------|-------------|
| id | string (auto) | Primary key |
| timestamp | Date | When water was logged |
| amountMl | number | Amount in milliliters |

**Streak**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| type | enum | "fasting" \| "hydration" |
| currentCount | number | Current consecutive days |
| longestCount | number | All-time best streak |
| lastCompletedDate | Date | Last date the goal was met |

**Badge**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Primary key |
| type | string | Badge identifier (e.g., "first_fast") |
| name | string | Display name |
| description | string | How it was earned |
| earnedAt | Date | When the badge was awarded |

### Indexes

- FastingSession: `[startTime]`, `[status]`
- MealLog: `[timestamp]`
- HydrationEntry: `[timestamp]`
- Streak: `[type]` (unique)
- Badge: `[type]` (unique)

## Screens & Navigation

The app uses a persistent bottom tab bar with 5 tabs. All screens use a dark theme (dark navy/charcoal backgrounds, indigo/purple accents).

### 1. Timer (Home) — Tab 1

The primary screen. A single-purpose fasting timer.

**Idle State (no active fast):**
- Protocol badge showing selected protocol (e.g., "16:8 Protocol")
- Empty circular progress ring
- Large "Start Fast" button (indigo, pill-shaped)
- Current streak count displayed below

**Active Fast State:**
- Protocol badge
- Circular progress ring filling clockwise, indigo stroke on dark track
- Large elapsed time display centered in ring (HH:MM:SS)
- Target duration below (e.g., "of 16:00:00")
- Percentage complete with visual indicator
- Start time shown
- "End Fast" button (red, pill-shaped)
- Current streak below

**Goal Reached State:**
- Ring fully filled, celebratory color shift (green)
- Timer continues counting (user may extend)
- "Goal Reached!" label
- "End Fast" button remains available

**Eating Window State (after ending fast):**
- Shows time remaining in eating window before next scheduled fast
- Muted visual treatment (informational, not action-oriented)

### 2. Meal Log — Tab 2

Simple free-text meal logging tied to the eating window.

- "Today" header with "+ Log Meal" button
- Eating window indicator bar (green) showing the current window times
- List of today's meals: description + timestamp, in card rows
- Date navigation (← Yesterday / Today / Tomorrow →)
- Tapping "+ Log Meal" opens a modal with a text input and timestamp (defaults to now)
- Meals can be deleted by swiping or via an edit mode

### 3. Hydration — Tab 3

Tap-based water tracking toward a daily goal.

- Daily goal display: current / target in ml (e.g., "1,600 / 2,500 ml") in cyan/blue
- Visual drop grid: filled drops for consumed, dimmed drops for remaining (each drop = 250ml)
- Quick-add buttons: "+ 250 ml", "+ 500 ml", "Custom"
- Custom opens a simple number input
- Today's log below: timestamped list of entries
- Entries can be deleted (swipe or edit mode)

### 4. Progress — Tab 4

Streaks, history, and badge collection.

**Stats Row (top):**
- Three cards side by side: Fasting Streak (orange), Hydration Streak (cyan), Total Fasts (indigo)

**Weekly Calendar:**
- 7-day row (M-T-W-T-F-S-S) with status circles:
  - Green with checkmark = completed fast
  - Indigo with ellipsis = in progress
  - Dark/empty = no data

**Fasting History:**
- Scrollable list of past fasts: date, protocol, duration, status
- Tapping a fast shows detail (start/end time, notes, whether goal was met)

**Badge Collection:**
- Grid of badge cards: icon + name
- Earned badges are full opacity with earned date
- Unearned badges are dimmed with lock icon and criteria text visible

### 5. Settings — Tab 5

Grouped settings in iOS-style sectioned list.

**Fasting Section:**
- Fasting Protocol — tap to select from supported protocols
- Notifications — toggle on/off (uses Notification API)

**Hydration Section:**
- Daily Water Goal — tap to set target in ml

**Data Section:**
- Export Data — downloads all data as a JSON file
- Import Data — file picker to restore from JSON backup
- Clear All Data — destructive action with confirmation dialog

**About Section:**
- Tips & Guides — navigates to bundled content
- Version — displays app version

## Fasting Protocols

| Protocol | Fasting Window | Eating Window | Category |
|----------|---------------|---------------|----------|
| 12:12 | 12 hours | 12 hours | Beginner |
| 14:10 | 14 hours | 10 hours | Beginner |
| 16:8 | 16 hours | 8 hours | Popular |
| 18:6 | 18 hours | 6 hours | Intermediate |
| 20:4 | 20 hours | 4 hours | Advanced |
| OMAD | 23 hours | 1 hour | Advanced |
| 5:2 | 2 days/week | 5 days/week | Weekly |

**5:2 Special Handling:**
- No continuous timer. User marks individual days as "fast days."
- The app tracks 2-per-week completion.
- Progress screen shows which days of the week were marked.

## Gamification

### Streak Rules

- **Fasting streak** increments when a completed fast meets or exceeds the protocol's target duration. Evaluated at fast completion.
- **Hydration streak** increments when the daily water goal is met. Evaluated at midnight (or on next app open after midnight).
- Streaks reset if the previous day's goal was not met.
- Both "current" and "longest" streaks are tracked per type.

### Badge Catalog

| Badge | Name | Criteria |
|-------|------|----------|
| ⚡ | First Fast | Complete 1 fast |
| 🔥 | Week Warrior | 7-day fasting streak |
| 🏆 | Month Master | 30-day fasting streak |
| 💯 | Century | 100 total completed fasts |
| 💧 | Hydro Start | Meet hydration goal for the first time |
| 🌊 | Hydro Habit | 7-day hydration streak |
| 💪 | Extended | Complete a 20h+ fast |
| 🌅 | Early Bird | Start a fast before 8 PM |
| 🧪 | Protocol Explorer | Complete fasts with 3 different protocols |

- Badges are earned once and permanently recorded with an `earnedAt` timestamp.
- Unearned badges are visible in a locked/dimmed state with criteria shown.
- A toast notification appears when a badge is newly earned.

## Static Tips & Guides

Bundled content shipped with the app, accessible from Settings > Tips & Guides. Content is stored as markdown files in `src/content/` and rendered at build time.

**Content Categories:**

1. **Getting Started** — What is intermittent fasting, choosing your first protocol, what to expect in the first week
2. **Protocols Explained** — One guide per supported protocol covering benefits, who it's for, and tips for success
3. **Hydration** — Why hydration matters during fasting, recommended intake, signs of dehydration
4. **Common Questions** — Does coffee break a fast? Can I exercise while fasting? What about medications? Is fasting safe for everyone?

**Implementation:** Simple list view → detail view navigation. Markdown files in a `/content` directory. Contributors can add or edit guides via pull requests.

## Notifications

Uses the browser Notification API (with user permission):

- **Goal reached** — "Congratulations! You've hit your [protocol] fasting goal."
- **Eating window closing** — "Your eating window closes in 30 minutes." (optional, configurable)
- **Hydration reminder** — Periodic reminder if significantly behind goal (optional, configurable)

Notifications require explicit user opt-in. All notification settings are in Settings > Notifications.

## Data Portability

- **Export:** Downloads a single JSON file containing all IndexedDB tables (UserProfile, FastingSession, MealLog, HydrationEntry, Streak, Badge). File is named `openfast-backup-YYYY-MM-DD.json`.
- **Import:** File picker accepts `.json` files. Validates schema before importing. User chooses between "merge" (add missing records) or "replace" (wipe and restore). Confirmation dialog before proceeding.
- **Clear All Data:** Wipes all IndexedDB tables. Requires typing "DELETE" to confirm (destructive action).

## PWA Requirements

- **manifest.json:** App name ("OpenFast"), theme color (dark navy #0f0f1a), background color (#0f0f1a), display: standalone, orientation: portrait
- **Icons:** 192x192 and 512x512 PNG icons
- **Service Worker:** Precache all app shell assets. Cache-first strategy for static content. No network requests needed at runtime.
- **Install Prompt:** Show a subtle banner on first visit encouraging "Add to Home Screen"
- **Offline:** App must work 100% offline after first load. No degraded mode — full functionality always available.

## Visual Design

- **Theme:** Dark mode only (dark navy #0f0f1a to #1a1a2e gradients)
- **Accent Colors:** Indigo/purple (#818cf8, #6366f1) for primary actions, cyan (#38bdf8) for hydration, green (#4ade80) for success/completion, orange (#f97316) for streaks, red (#ef4444) for destructive actions
- **Typography:** System font stack (system-ui), bold weights for numbers/timers
- **Border Radius:** 10-12px for cards, 20-24px for pill buttons
- **Spacing:** Generous padding, touch-friendly tap targets (minimum 44px)
- **Transitions:** Subtle fade/scale transitions on state changes, smooth progress ring animation

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- Color is never the sole indicator of state (icons/text accompany color changes)
- ARIA labels on icon-only buttons and the progress ring
- Semantic HTML (nav, main, section, button)
- Respects `prefers-reduced-motion` for animations

## Testing Strategy

- **Unit Tests (Vitest):** Database operations, streak/badge evaluation logic, timer calculations, protocol configurations
- **Component Tests (React Testing Library):** Each screen renders correctly in various states, user interactions trigger expected state changes
- **PWA Tests:** Service worker caches correctly, app installs, offline mode works
- **Manual Testing:** Test on iOS Safari, Android Chrome, and desktop Chrome/Firefox

## Open Source Considerations

- **License:** MIT
- **Contributing Guide:** CONTRIBUTING.md with setup instructions, coding standards, PR process
- **Code of Conduct:** Adopt Contributor Covenant
- **Issue Templates:** Bug report, feature request
- **CI:** GitHub Actions running lint, type check, and tests on PRs
