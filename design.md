# Learnup Design System

## Overview
Learnup is a dark-mode-first coding education platform designed for college students learning Data Structures and Algorithms. The design language is intended to feel gamified, modern, and engaging (often described as "Duolingo for coding"). 

The current design system is built using **Tailwind CSS v4** and leverages **shadcn/ui** for foundational component structures, tightly controlled through a comprehensive set of CSS variables defined in `globals.css`.

## Core Aesthetics
* **Theme**: Dark-mode-first with high contrast.
* **Surfaces**: Deep navy and slate (strict slate).
* **Accents**: Teal, cyan, and vibrant energy colors to evoke a gamified, interactive feel.
* **Typography**: Clean and technical using `Geist Sans` for UI and `Geist Mono` for code elements.

## Color Palette Tokens

### Backgrounds & Surfaces
* **Background (`--background`)**: 
  * Light: `#ffffff`
  * Dark: `#020617` (slate-950)
* **Surface (`--surface`)**: 
  * Light: `#ffffff`
  * Dark: `#0f172a` (slate-900)
* **Secondary Surface (`--surface-secondary`)**: 
  * Light: `#f1f5f9`
  * Dark: `#1e293b` (slate-800)
* **Surface Hover (`--surface-hover`)**:
  * Light: `#e2e8f0`
  * Dark: `#334155`

### Brand Colors (Slate Variations)
* **Brand 400 (`--brand-400`)**: `#94a3b8` (Muted slate)
* **Brand 500 (`--brand-500`)**: `#64748b`
* **Brand 600 (`--brand-600`)**: `#475569`
* **Brand 700 (`--brand-700`)**: `#334155`

### Accents & Gamification Colors
Used for progress tracking, streaks, success states, and warnings.
* **Accent Green (`--accent-green`)**: `#10b981` (Used for correct answers, success, and streaks)
* **Energy (`--energy`)**: `#f59e0b` (Used for XP, coins, or warnings)
* **Destructive (`--destructive`)**: `#ef4444` (Used for errors or destructive actions)

### Typography Colors
* **Primary Text (`--foreground` / `--text-primary`)**: 
  * Light: `#020617`
  * Dark: `#f8fafc`
* **Secondary Text (`--text-secondary`)**: `#475569` (Light) / `#94a3b8` (Dark)
* **Muted Text (`--text-muted`)**: `#64748b` (Light & Dark)

## Typography Architecture
The platform relies on the Geist font family provided by Vercel:
* **Sans-serif (`var(--font-sans)`)**: `Geist Sans` - Used for all headings, body copy, buttons, and general UI elements.
* **Monospace (`var(--font-mono)`)**: `Geist Mono` - Used strictly for code editors, inline code snippets, terminal outputs, and algorithmic problem descriptions.

## Component Styling (shadcn/ui overrides)
The project overrides default shadcn/ui slate variables to create a more cohesive and customized gamified experience.
* **Cards (`--card`)**: Maps to the primary surface color to create distinct content blocks.
* **Borders (`--border`)**: Uses subtle slate lines (`#e2e8f0` in light, `#334155` in dark) to separate panes (like the split-pane code editor).
* **Radius (`--radius`)**: Currently set to `0rem` for a sharper, more technical aesthetic, though variables for `-sm`, `-md`, `-lg`, `-xl`, and `-2xl` exist in the theme for future softer gamified elements.

## Layout & Workspace
* **Main Navigation**: Fixed top navbar with glass/solid background, housing branding, routing, theme toggle, and authentication actions.
* **Split-Pane Editor (Planned)**: The core interactive zone will feature a split-pane design using the deep surface colors to differentiate the problem description (left) from the Monaco code editor and terminal output (right).

## CSS Architecture
* **Global Variables**: All tokens are declared in `:root` and `.dark` scopes within `globals.css`.
* **Tailwind v4 `@theme`**: The `@theme inline` block maps the CSS variables directly into Tailwind utility classes (e.g., `--color-surface: var(--surface)` allows the use of `bg-surface`).
* **Animations**: Custom keyframes (like `ticker`) are defined in standard CSS and mapped to utility classes (e.g., `.animate-ticker`).
