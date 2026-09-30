# Grading proof (arrays path)

Proves fixture grading for **10 lessons × 5 languages** using the real `runFixtures` path (JavaScript via `runJavaScriptOnServer` / `node:vm`, other languages via local Piston). Does **not** call `submitLessonAttempt` or load `.env.local`.

## Prerequisites

1. **Local Piston** at `http://localhost:2000/api/v2` with runtimes for `python`, `c`, `c++`, and `java` already installed (the script only GETs `/runtimes`; it does not install packages).
2. **Node** with project dependencies installed (`npm ci`).

## Batch command (PowerShell)

```powershell
$env:PISTON_API_URL = "http://localhost:2000/api/v2"
node scripts/grading-proof/run.mjs
```

- Exit **0**: 50/50 correct passes and 50/50 wrong-answer negatives with `wrong_answer` classification.
- Exit **1**: assertion mismatch (see `outputs/batch.json` per-fixture evidence).
- Exit **2**: missing/wrong Piston URL, unreachable runner, or missing Piston runtime.

Reports: `scripts/grading-proof/outputs/batch.json` and `batch.md` (gitignored).

Reference solutions: `solutions.ts` (correct). Wrong submissions reuse each lesson **starter** read path plus `GRADING_PROOF_WRONG`.

## Submit replay (required for full proof)

Batch success alone is **not** full proof. After batch exit 0:

1. Start dev with **both** env vars pointing at local Piston:
   ```powershell
   $env:PISTON_API_URL = "http://localhost:2000/api/v2"
   $env:NEXT_PUBLIC_PISTON_API_URL = "http://localhost:2000/api/v2"
   npm run dev
   ```
2. Use **local** Supabase (`127.0.0.1` / `localhost`) or another disposable project — **not** the linked production ref `ttsfrjbrlrouqnjotxud`.
3. Log in as a **dedicated test user** (not your real account).

For each lesson in `path.json` order and each language in `SUPPORTED_LANGUAGES` order:

| Step | Action |
| --- | --- |
| 1 | Open `/learn/arrays/<slug>`, select language |
| 2 | Paste **correct** source from `getCorrectSolution` in `solutions.ts`, Submit |
| 3 | Record grading line (e.g. `Passed — …`) and saved/progress text |
| 4 | Paste **wrong** source (starter + sentinel via `wrongFromStarter`), Submit |
| 5 | Record `Not quite — …` / **Wrong answer** rows |

Record **100** outcomes in `outputs/submit-replay.md` and consolidate in `outputs/report.md`. After at least one wrong submit on a lesson already passed correctly, confirm dashboard **XP did not increase** from that wrong submit.

Do not reset attempts or delete test data automatically.
