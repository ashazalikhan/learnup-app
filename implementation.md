# Learnup — Implementation Plan

Learnup is a gamified coding platform ("Duolingo for coding") for college students learning DSA. This document tracks the branching strategy and commit workflow across all development phases.

---

## Branching Strategy

Each phase lives on its own feature branch. Once a phase is complete and tested, it gets merged into `main` via a Pull Request. This keeps the git history clean, reviewable, and maintainable.

```
main
 ├── feature/01-init-and-infrastructure      ← Phase 1 (current)
 ├── feature/02-coding-interface             ← Phase 2
 ├── feature/03-gamification-and-progress    ← Phase 3
 └── feature/04-leaderboard-challenges       ← Phase 4
```

---

## Phase 1: Foundation & Infrastructure
**Branch:** `feature/01-init-and-infrastructure`
**Status:** 🔄 In Progress

| # | Commit | Description |
|---|--------|-------------|
| 1 | `Init Next.js project with App Router, TypeScript, TailwindCSS` | Scaffold the project using `create-next-app` with app router, TypeScript, and Tailwind v4. |
| 2 | `Setup base CSS architecture and design tokens` | Define glassmorphism tokens, color palette, typography, and dark mode support in `globals.css`. |
| 3 | `Configure Supabase client and environment utilities` | Create Supabase client helpers and `.env.example` with required variables. |
| 4 | `Create foundational UI components (Button, Input, Card)` | Build reusable, styled UI primitives that follow the design system. |

---

## Phase 2: Core Coding Interface
**Branch:** `feature/02-coding-interface`
**Status:** ⏳ Pending

| # | Commit | Description |
|---|--------|-------------|
| 1 | `Implement code editor component (Monaco Editor)` | Integrate Monaco Editor with multi-language syntax highlighting. |
| 2 | `Integrate Code Execution API wrapper` | Build the API wrapper for Piston/Judge0 to compile and run user code. |
| 3 | `Build problem description and requirements panel` | Create the split-panel view showing the coding problem alongside the editor. |
| 4 | `Assemble the split-pane workspace layout` | Combine editor, problem panel, and output into a responsive workspace. |

---

## Phase 3: Gamified Progress & Dashboard
**Branch:** `feature/03-gamification-and-progress`
**Status:** ⏳ Pending

| # | Commit | Description |
|---|--------|-------------|
| 1 | `Create user progress and streak tracking UI` | Build streak counter, XP bar, and progress ring components. |
| 2 | `Implement gamification state management` | Wire up progress tracking with Supabase for persistent state. |
| 3 | `Build the main student dashboard layout` | Create the dashboard page with progress overview, recent activity, and quick actions. |
| 4 | `Add dynamic micro-animations for task completion` | Confetti, level-up animations, and streak milestone celebrations. |

---

## Phase 4: Leaderboard & Daily Challenges
**Branch:** `feature/04-leaderboard-challenges`
**Status:** ⏳ Pending

| # | Commit | Description |
|---|--------|-------------|
| 1 | `Implement Daily Challenges fetching and display` | Create challenge cards with difficulty tags, timer, and submission flow. |
| 2 | `Build global Leaderboard UI` | Ranked list with avatars, scores, and filtering (daily/weekly/all-time). |
| 3 | `Integrate Leaderboard with backend statistics` | Connect leaderboard to Supabase aggregated user stats. |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Backend / DB | Supabase |
| Code Execution | Piston API (free) |
| Fonts | Geist Sans + Geist Mono |
