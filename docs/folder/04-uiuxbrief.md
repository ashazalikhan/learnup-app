# UI/UX brief: a new design direction

Replaces the current look · desktop only

> Extracted from the six build docs written 8 October 2026. Historical snapshot, not a fresh repo audit. The Master Plan wins on scope and order. Read design-rules.md first for the design decisions locked on 12 October; those supersede the older colour choices, accent placeholders and lesson-layout assumptions below. EXISTS refers to feature/09-classroom-core at the original review, not necessarily main today.

You said LearnUp looks like AI slop and you hate how it looks, and you pointed at coddy.tech as the reference. Fair: the app was built screen by screen with no locked design rules, so each Cursor session invented its own. This brief proposes a NEW direction borrowing Coddy's layout ideas, with main colour and contrast left for you to choose. Nothing here changes behavior, only look and feel. The Master Plan puts UI polish in Act 3; see "When to do it" for a way to fix the look early without breaking that order.

## Why it looks like slop (and what to stop doing)

AI-built UIs look generic because the model reaches for the same defaults. Naming them makes them easy to ban.

| Slop tell | Why it reads as fake | Do this instead |
| --- | --- | --- |
| Purple-to-blue gradients, glow, glassy blurred cards | Every AI landing page uses them. | Flat surfaces, 1px borders, no gradients on UI. One accent colour. |
| Everything is a big rounded card with a shadow | No hierarchy; the screen is a pile of boxes. | Few containers. Use spacing and thin dividers. 6-8px radius, no drop shadows. |
| Emoji and cartoon icons as decoration | Looks like a toy, not a lab. | One icon set (lucide, already in the repo), 16px, monochrome. |
| Mascot on every screen | Distracts from the code. | Mascot only on empty states and a pass moment. Never on the editor or roster. |
| Centered hero text and fat buttons inside tools | Marketing look inside a working tool. | Left-aligned, compact, information-dense, like an IDE. |
| Five font sizes and random weights per screen | No rhythm. | The type scale below. Nothing outside it. |
| Colour used for decoration | Colour should mean something. | Green = passed, amber = attention, red = failed, accent = the one thing to click. |

## Reference: what coddy.tech actually does (you picked it)

You said you like the layout of coddy.tech and want to choose main colour and contrast together. I opened the live site on 8 Oct 2026 (home page screenshot) and read its page text plus an outside review. What follows is structure and ideas to borrow, not assets to copy. Do not reuse Coddy's logo, mascot art, icons or typeface; build your own.

| What Coddy does | Source | Borrow for LearnUp? |
| --- | --- | --- |
| Light page by default, white background, dark text, with a dark/light toggle in the top bar | Home page screenshot | Yes: light default, dark theme toggle. Students can switch in a dim lab. |
| Top bar: logo left, a few pill-bordered dropdown menus (Catalog, Spaces, Resources, Company), one solid blue "Start learning" button, theme toggle, language | Home page screenshot | Yes, simplified: logo, My labs, Dashboard, XP/streak, theme toggle, account. No marketing menus. |
| One saturated primary blue used for the main action, links and highlights. Everything else is neutral grey/white | Screenshot | Yes: one main colour. You choose which (options below). |
| Chunky buttons with a darker bottom edge so they look pressable, game-like | Screenshot | Yes, on student screens only. Keep faculty screens flat. |
| Big centered display-font headline, short sub-line, one big button, friendly mascot | Screenshot | Marketing pages only. Our tool screens stay left-aligned and dense. Mascot only on empty states. |
| A live counter of submissions on the home page | Screenshot / page text | Nice idea for the faculty side: "21 of 40 submitted" live. |
| Lesson screen is a clean three-area split: instructions left, editor centre, live output right | Outside review (trendleveltech.com/coddy-review) | Yes, this is the lab screen pattern below. Tests show a pass/fail icon per test with input and output. |
| Streak calendar with freeze days, XP, leagues and a leaderboard with top 7 advancing | Home page text | Streak yes (small). Leagues no: your leaderboard is weekly, section-only, consistency-scored (locked in the plan). |
| Roadmaps as ordered steps, certificates, audio and AI helper modes | Home page text | Roadmap-as-path fits PathMap. Certificates, AI helper: not in plan, skip. |

### What I could not see

I only saw the public home page. I did not see a logged-in lesson page, so the three-area lesson layout comes from an outside review, not my own screenshot. If you can send a screenshot of a Coddy lesson screen you like, I will tune the lab pattern to it.

## Your choice: main colour and contrast (three options, nothing locked)

Contrast here means how strongly text and the main colour stand out from the background, and whether the page is light or dark. Pick one row in each table. I will then write the final tokens into the plan.

| Main colour option | Hex (starting point) | Feel | Watch out |
| --- | --- | --- | --- |
| 1. Coddy-like blue | #0A6CFF | Familiar, friendly, closest to what you liked. | Most "default" of the three; easiest to look generic. Differentiate with type and layout. |
| 2. Lab green | #10B981 (light) / #3DDC97 (dark) | Terminal and "tests passing" feel; ties to success. | Green is also the passed colour, so use blue or neutral for links and keep green for accent plus success. |
| 3. Indigo/violet | #5B5BF0 | Modern, a bit more premium. | Drifts toward the AI-gradient look you dislike; use flat only, no gradients. |

| Contrast option | Background / text | Best for | Trade-off |
| --- | --- | --- | --- |
| A. Light, high contrast (Coddy-like) | Off-white #FAFAFA, near-black text #14171C, borders #E4E6EA, a dark navy band for the footer or nav accents | Bright labs, projector view of the roster, familiar feel | Long coding sessions are tiring on bright screens; editor can still be dark. |
| B. Dark, softer contrast | Background #0B0D10, text #E6E8EB, borders #262B33 | Editor-heavy sessions, dim rooms, "real dev tool" feel | Faculty roster on a projector can look dim. |
| C. Light app, dark editor (my pick) | App chrome light as in A; the code editor and output panel dark as in B | Gets Coddy's friendly layout and a proper IDE feel where students spend 90 minutes | Two surface sets to maintain; tokens below keep it simple. |

### My suggested combo, not locked

Colour 1 or 2 with contrast C. It borrows the layout you like and keeps the editor serious. If you want the closest match to Coddy, take colour 1 with contrast A.

## Colour system structure (values depend on your choice above)

Put these in globals.css as CSS variables once, and make every component read them. No hex codes inside components. Why: changing the look later is a one-file edit, and Cursor cannot invent colours. Starting values below use contrast C with colour 1 as a placeholder. They change after you pick.

| Token | App (light) | Editor and output (dark) | Use |
| --- | --- | --- | --- |
| --bg | #FAFAFA | #0B0D10 | Page background |
| --surface | #FFFFFF | #12151A | Panels, table body |
| --surface-raised | #F1F3F5 | #1A1E25 | Hover rows, active tab |
| --border | #E4E6EA | #262B33 | All dividers and outlines |
| --text | #14171C | #E6E8EB | Main text |
| --text-muted | #5E656E | #9097A1 | Secondary text |
| --accent | #0A6CFF | #5C9DFF | Primary button, focus ring, current lesson |
| --success | #12A06B | #3DDC97 | Passed |
| --warning | #B7791F | #F5B544 | Late, stuck, runner slow |
| --danger | #C53030 | #F2685B | Failed, error |

Check every pair against a 4.5:1 contrast ratio on a real lab monitor before locking, and never use colour alone for status; add a text label or icon.

## Type scale (PROPOSED)

| Role | Size / weight | Font |
| --- | --- | --- |
| Page title | 28 / 600 | Inter (or Geist) |
| Section heading | 20 / 600 | Inter |
| Body | 14 / 400, line height 1.5 | Inter |
| Label, table header, chip | 12 / 500, slightly tracked | Inter |
| Small meta (time, ids) | 12 / 400 muted | Inter |
| Code in editor and output | 14, line height 1.6 | JetBrains Mono |

Why 14 for body and code: lab PCs are often 1366x768 monitors at arm length. Smaller than 14 hurts at minute 80. Two typefaces, six sizes, that is the whole system.

## Spacing, shape, motion

- Spacing steps only: 4, 8, 12, 16, 24, 32. If a value is not on the list, it is wrong.
- Radius: 6px for controls, 8px for panels. No fully round buttons except chips.
- No box shadows. Depth comes from the three surface tones and borders.
- Motion under 180ms, only for state change. Allowed moments: lesson passed (accent flash on the row), XP number ticking up, unlock. The faculty roster does not animate except the status chip changing.

## Lab screen patterns (the screens that matter)

Design these first. They are where a student or professor spends 90 minutes.

| Screen | Pattern |
| --- | --- |
| Lesson / editor | Three areas, as on Coddy. Left 30%: question text, examples, constraints. Centre: code editor on the dark editor surface with the language picker and the Run / Run tests / Submit buttons above it (Submit is the only accent-filled button). Bottom: a result drawer with tabs Output, Tests, Result. A failed submit shows the reason in one line first (Wrong answer, Timeout, Runtime error, Runner unavailable) then details. A thin top bar shows the session timer and question n of m when in a live lab (PLANNED timer). |
| My labs / Join | A single column list. Live session on top as a row with course, week, title, time left and one button, Open lab. Under it, an input for a join code. No illustrations. |
| Dashboard / PathMap | A vertical path of 10 nodes. Node states: locked (muted outline), current (accent outline), passed (filled accent with check). XP and streak as plain numbers in the top bar, not big cards. Keep the mascot only on the empty first-run state. |
| Faculty roster | A dense table, one row per student, one narrow column per question. Cell = small status chip: not started (muted dash), opened (outline), submitted (amber dot), passed (green check). A summary line on top: 12 not started, 7 working, 21 passed. Last activity column. Sticky header. Readable from 2 metres: chip text at 12px but chips 24px tall with clear colour. |
| Faculty section page | Join code in a large monospace block with Copy, Rotate and Enable toggle. Sessions listed below as a plain table. |
| Weekly leaderboard (Act 3) | A table, this week and consistency across weeks. No podium graphic, no speed ranking. |

## Component rules

- Buttons: primary (accent fill, one per screen), secondary (border), ghost. 32px tall in tools, 40px on forms.
- Status chip: 24px tall, 12px text, icon plus label, 6px radius. One component, used by roster, lesson list and results.
- Tables: no zebra stripes, hairline row borders, hover tint with --surface-raised.
- Empty states: one sentence and one action. The only place for a mascot.
- Errors: inline, plain language, say what the student can do next ("Your code is saved. Try Submit again.").
- Use the existing shadcn and base-ui primitives restyled via the tokens. Do not add new component libraries.

## When to do it (so it fits the plan)

### This touches the plan order

The Master Plan puts "make the screens coherent" in Act 3. I am not changing the plan. I am proposing a small early step you can approve: a tokens-only pass (colours, fonts, spacing, radius in globals.css, no layout changes). It is low risk, takes one Cursor session, and removes most of the slop feeling. The full screen rebuilds stay in Act 3. If you agree, the plan doc gets one new line for the tokens pass; tell me and I will add it there.

- Step 1: you pick main colour and contrast from the options above.
- Step 2: lock the tokens into globals.css, with the light and dark themes and the dark editor panel.
- Step 3 (Act 3): rebuild editor, roster, My labs in that order, using the patterns above.
- Step 4: rest of the screens, remove leftover one-off styles.

## Visual QA you can do yourself

- Look at each key screen at 1366x768 with real lesson text, long names and a 40-row roster.
- Screenshot before and after every UI session. Do not trust the Cursor summary.
- Squint test: in 3 seconds you should see what to click and what state you are in.
- Keyboard only: tab through the editor screen, focus ring visible, escape leaves the editor.

Accessibility basics: never colour alone for status, visible focus, and warn before the 12-minute idle sign-out on shared PCs (PROPOSED; today it just signs out).

## Source

Six build docs: https://files.instinct.com/pzttn9nvst48-learnup-the-six-build-docs
Master Plan: https://files.instinct.com/file-01M3MQKF6WCVPAYMN9EYY2Z2N2
Session-evidence brief: https://files.instinct.com/zeudmkp14sdm-learnup-008-session-evidence
