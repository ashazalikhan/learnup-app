# LearnUp design rules

Locked on 12 October 2026. Desktop-only app. Read this in every fresh Cursor chat before planning or editing. These rules govern every prompt's output. They do not authorize a redesign, theme implementation, new features or a change to the Master Plan's build order.

## Precedence and scope

The Master Plan stays the source of truth for scope and order. These locked rules replace the older UI brief's unchosen colour options, placeholder accent values and review-based lesson layout. All other six-doc guidance remains reference, with EXISTS / PLANNED / PROPOSED tags intact. If scope conflicts, stop and flag it rather than inventing a second plan.

For migration 008, apply this as a no-regression gate to touched UI only. Do not redesign screens or change themes in the session-evidence task. The approved 008 brief covers only session evidence; its larger source-storage proposal remains parked.

## Colour and themes

- Single accent across the app: #0856CC. Declare it once as --accent in globals.css for both app themes; no alternate dark-theme blue and no component-level hex colours.
- Keep the app's light/dark toggle. The code editor is always dark, even when app chrome is light. Keep editor/output surfaces dark and neutral.
- Use neutral surfaces, 1px borders and thin dividers. No UI gradients, glow, glass blur or drop shadows.
- Colour conveys state, never decoration: green passed, amber attention, red failed; blue marks the primary action, selection or focus. Semantic status colours are not extra accents.
- Check text contrast at least 4.5:1. Do not make small blue text on dark surfaces fail contrast just to use the accent. Use readable neutral text plus a blue border/indicator where needed; do not invent a lighter accent. Always pair statuses with text or icons.

## Coddy lesson reference

Use the user's lesson-screen reference as layout inspiration, not a source of assets or new features:

- Slim icon rail at the far left and a thin top bar.
- Lesson/instructions pane on the left, about one third as a starting point; editor on the right. Tune proportions with real lesson content at 1366x768, not a guessed fixed ratio.
- Test-cases strip below the editor, split into Output and Expected Output. Keep the existing Run / Run tests / Submit meanings and failure details intact. Do not expose hidden fixture answers through this layout.
- Flat dark greys in the coding workspace. One prominent blue action, as Coddy's Run Code button demonstrates. Never give Run and Submit competing filled emphasis. Keep the appropriate primary action for the current LearnUp task; this reference does not rename or add actions.
- Collapsed hint rows, a plain challenge callout with a left blue rule, and a small level label only where corresponding content already exists.
- Compact counters belong in the top bar, not oversized cards. Coddy's streak/gems/XP counters are reference only: keep existing LearnUp XP/streak; do not add gems, a store, a timer or other out-of-scope features.
- Left-aligned, compact, information-dense tools. Hierarchy comes from spacing, type and dividers, not effects.

## Hard no-slop checklist

Every Cursor plan, implementation and review must explicitly pass these checks for its affected output. Mark unrelated visual checks not applicable with a reason; never claim screenshot verification without screenshots.

- [ ] No gradients, glow, glass blur or shadows.
- [ ] #0856CC is the only accent; no one-off component colours. Status colours remain semantic.
- [ ] Few containers; no pile of rounded shadow cards. Controls use 6px radius, panels 8px; fully round shapes only for chips where needed.
- [ ] Existing Lucide icons only, normally 16px and monochrome. No emoji/cartoon decoration.
- [ ] No mascot on the editor or roster. Mascot is limited to empty states or a pass moment elsewhere.
- [ ] No centered hero copy or oversized marketing buttons inside tools.
- [ ] Fixed type roles and spacing steps only; no random weights or sizes.
- [ ] App light/dark toggle retained; editor remains dark in both themes.
- [ ] One clear primary action in each working screen; secondary actions stay border/ghost.
- [ ] Status uses icon/label plus colour. Focus is visible; text contrast meets 4.5:1.
- [ ] Real-content screenshots reviewed at 1366x768, including long names and a 40-row roster where relevant. No clipping or concealed errors.
- [ ] No new behaviour, features, libraries or scope slipped in as design work.

## Type, spacing and motion

Use the existing UI font if it is Inter or Geist consistently, plus JetBrains Mono for code. Do not mix Inter and Geist across screens. The older brief calls these "six sizes", but it actually specifies six roles at three sizes:

| Role | Size / weight | Line height |
| --- | --- | --- |
| Page title | 28px / 600 | Existing consistent heading rhythm |
| Section heading | 20px / 600 | Existing consistent heading rhythm |
| Body | 14px / 400 | 1.5 |
| Label, table header, chip | 12px / 500 | Consistent compact rhythm |
| Small metadata | 12px / 400, muted | Consistent compact rhythm |
| Code and output | 14px, JetBrains Mono | 1.6 |

Spacing steps: 4, 8, 12, 16, 24, 32px. Tool buttons 32px tall, form buttons 40px. Status chips: 24px tall, 12px text, icon plus label, 6px radius. Tables: hairline row borders, no zebra stripes, neutral hover tint. Motion under 180ms, only state changes such as pass, XP tick or unlock. Roster stays still except changing status chips.

## Other lab screens

- My labs: single-column rows, live session first, one Open lab action; plain join-code input. No illustrations. Time-left text only after timers are actually implemented.
- PathMap: ordered vertical path; muted locked outline, blue current outline, passed check with a semantic success state. XP/streak are plain top-bar numbers, not large cards. Keep the current placeholder lesson count until curriculum work changes it.
- Faculty roster: dense student-by-question table, sticky header, last activity and summary counts grounded in actual states. Current states are not_started, opened, submitted, passed. Do not label opened as coding/working or invent stuck until those signals exist.
- Empty states: one sentence and one action. Errors: inline plain-language reason and the next action. Never claim code was saved unless the save succeeded.
- Restyle existing shadcn/base-ui primitives through tokens; add no component library.

## Required Cursor closeout

List the changed files, actual build/lint results, applicable checklist results and any remaining visual checks. Provide before/after screenshots for UI changes. Stop and report a conflict instead of guessing. For 008, retain the classroom-core merge gate, plan-first review and user-applied SQL rule.
