# Flipwise brand assets

Cinematic Noir design system — high-contrast obsidian + volt lime.

| File | Use |
|------|-----|
| `icon.png` | Master app icon (1024×1024 source) |
| `flipwise-mark.svg` | Vector mark — overlapping flashcards |
| `flipwise-logo-stacked.png` | Vertical lockup — splash screen (dark) |
| `flipwise-wordmark-horizontal.png` | Horizontal lockup — marketing / dark backgrounds |

## Brand colors (Cinematic Noir)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#141313` | App canvas, launcher background |
| Primary container | `#B8EC44` | CTAs, front card, active states |
| Surface variant | `#353434` | Back card, secondary surfaces |
| On-surface | `#E5E2E1` | Body text on dark |
| Primary fixed dim | `#A4D72F` | Accent highlights |

## App icon

Android adaptive icon: `android/app/src/main/res/drawable/ic_launcher_foreground.xml` + `#141313` background.

After updating `icon.png`:

```powershell
cd mobile
powershell -ExecutionPolicy Bypass -File scripts/generate-app-icons.ps1
npx react-native run-android
```
