# Learnup

Learnup is a gamified coding platform tailored for college students to learn Data Structures and Algorithms (DSA). Think of it as "Duolingo for coding".

## Features
- **Coding Interface:** Write and execute code in C++, JavaScript, Python, and Java.
- **Gamified Progress:** Track your learning journey with daily streaks and progress bars.
- **Leaderboard:** Compete with peers based on challenges completed.
- **Daily Challenges:** Targeted problems mapped to college coursework.

## Technologies
- **Frontend Framework:** Next.js
- **Database / Backend:** Supabase
- **UI/UX:** Modern glassmorphism, dynamic animations
- **Code Execution:** Free API (e.g., Piston or Judge0)
- **Supported Languages:** C, C++, JavaScript, Python, Java

## Getting Started
*(Instructions will be added once the project is initialized)*

### Local Piston runner

For local grading (C/C++/Java/Python/JS), run a self-hosted [Piston](https://github.com/engineer-man/piston) API and point LearnUp at it.

**Start the container** (persists installed runtimes in the `piston-packages` volume; 60s default run timeout):

```bash
docker run --privileged --restart unless-stopped -dit -p 2000:2000 -v piston-packages:/piston/packages -e PISTON_RUN_TIMEOUT=60000 --name piston_api ghcr.io/engineer-man/piston
```

**Install runtimes** (PowerShell; installs latest `*` for each language):

```powershell
'python','java','gcc','node' | % { Invoke-RestMethod -Uri http://localhost:2000/api/v2/packages -Method Post -ContentType 'application/json' -Body (@{language=$_; version='*'} | ConvertTo-Json) }
```

**`.env.local`** (restart `npm run dev` after saving):

```
PISTON_API_URL=http://localhost:2000/api/v2
NEXT_PUBLIC_PISTON_API_URL=http://localhost:2000/api/v2
```
