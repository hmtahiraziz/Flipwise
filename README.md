# Cardweave

**Cardweave** — AI-powered flashcard study app with spaced repetition.

- **App name:** Cardweave
- **Bundle ID:** `com.cardweave.app`

## Features

### Study & memory
- **Spaced repetition (SM-2)** — rate cards Again / Hard / Good / Easy; Cardweave schedules the next review
- **Review queue** — due and overdue cards grouped by deck, with streak and session progress
- **Flip cards** — tap to reveal answers during review
- **AI explanations** — get a short explanation for a card mid-session when something doesn’t click

### AI flashcard generation
- **Multiple inputs** — generate from a topic, pasted notes, PDF/document import, or camera scan of handwritten/printed notes
- **Controls** — card count, difficulty (beginner → advanced), Q&A or cloze formats, and language
- **Review before save** — preview and edit AI drafts, then add them to a deck

### Library & decks
- **Deck management** — create, edit, archive, and organize decks by subject
- **Card editor** — search, add, and edit cards manually
- **Home dashboard** — greeting, due count, estimated study time, and quick paths into review or AI generation

### Progress & practice
- **Stats** — streaks, mastery %, weekly activity chart, and per-deck breakdown
- **Weak-spot recommendations** — surface decks that need attention
- **Practice quizzes** — MCQ or typed-answer quizzes from any deck
- **Study planner** — set an exam date and daily study minutes

### Account & app
- **Auth** — Google sign-in or email/password via Clerk (verification + forgot password)
- **Onboarding** — first-launch slides covering generate, review, and progress
- **Settings** — light / dark / system theme, daily goal, haptics, sound, text scale, and legal docs (privacy, terms, data handling)
- **Profile** — avatar, stats, and account management

## Project structure

```
AIFlashcard/
├── backend/    Express + TypeScript + Drizzle + Neon Postgres
└── mobile/     React Native CLI 0.86 + NativeWind + Clerk
```

## Backend setup

```powershell
cd backend
npm install
copy .env.example .env
npm run db:push
npm run dev
```


## Mobile setup

```powershell
cd mobile
npm install --legacy-peer-deps
copy .env.example .env
```

### Mobile environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk publishable key — **wrap in quotes if it ends with `$`** |
| `API_BASE_URL` | **Yes** | Backend URL (see table below) |


### Native rebuild (Expo modules + OAuth)

After installing Clerk/Expo packages or changing `app.json` scheme, rebuild native apps:

```powershell
# Android
cd mobile/android; ./gradlew clean
cd ..; npx react-native run-android

# iOS (macOS)
cd mobile/ios; pod install
cd ..; npx react-native run-ios
```

### API URL by platform

| Platform | URL |
|----------|-----|
| Android emulator | `http://10.0.2.2:3000` |
| iOS simulator | `http://localhost:3000` |
| Physical device | Your machine's LAN IP (e.g. `http://192.168.1.10:3000`) |

For a physical Android device, also run:

```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:3000 tcp:3000
```

Configure in `mobile/.env` as `API_BASE_URL`.

## Dev workflow

1. `cd backend && npm run dev`
2. `cd mobile && npx react-native start --reset-cache`
3. `cd mobile && npx react-native run-android`

## App flow

1. **Onboarding** — welcome slides (first launch only)
2. **Auth** — Google or email sign-in via Clerk
3. **Library** — decks, AI generation, spaced repetition review

After changing `mobile/.env`, restart Metro with `--reset-cache`.

## Play Store (Android)

See **[mobile/docs/PLAY_STORE.md](mobile/docs/PLAY_STORE.md)** for the full release checklist.



Quick path:

```powershell
cd mobile
npm run keystore:generate
# create .env.production with HTTPS API + pk_live_ Clerk key
$env:ENVFILE=".env.production"
npm run android:bundle
```
