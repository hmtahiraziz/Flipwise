# Flipwise

**Flipwise** — AI-powered flashcard study app with spaced repetition.

- **App name:** Flipwise
- **Bundle ID:** `com.flipwise.app`

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

### Backend environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default `3000`) |
| `DATABASE_URL` | **Yes** | Neon Postgres connection string (`?sslmode=require`) |
| `CLERK_SECRET_KEY` | **Yes** | Clerk secret key (Dashboard → API Keys) |
| `CLERK_PUBLISHABLE_KEY` | **Yes** | Clerk publishable key |
| `OPENAI_API_KEY` | **Yes** | OpenAI key for AI card generation |
| `OPENAI_MODEL` | No | Chat model (default `gpt-4o-mini`) |
| `CORS_ORIGIN` | No | Allowed origin(s); default `*` |

Run tests: `cd backend && npm run test`


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

### Clerk Dashboard (required)

1. Create a Clerk application for Flipwise
2. Enable **Google** social connection
3. Enable **Email + Password** (optional secondary path)
4. Register native apps: iOS bundle `com.flipwise.app`, Android package `com.flipwise.app`
5. Under **Native applications → Allowlist for mobile SSO redirect**, add:
   - `flipwise://oauth-native-callback`

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
