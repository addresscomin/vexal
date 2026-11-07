# VYRO — Mobile Video Editor

VYRO is an original Android-first video editor project. It is developed independently and does not copy CapCut source code, branding, proprietary effects, or assets.

## Current foundation
- Premium dark editor shell with custom bottom navigation and icon treatment
- Home / project hub, editor workspace, effects library and Pro screen
- Android document picker for importing video
- Timeline workspace foundation and feature architecture notes
- Native Kotlin + Jetpack Compose project

## Build
Open this folder in Android Studio (or open the repository and select this folder), install Android SDK 35, then run:
```bash
./gradlew assembleDebug
```

## Planned editing engine
The UI foundation is not yet a production rendering engine. The roadmap separates features that need native media processing, ML models, cloud services, licensing, or device-specific testing. See `docs/ROADMAP.md`.

## Integrations
- Supabase: planned for optional account, cloud project sync, licensed asset catalog and entitlements. No project keys are committed.
- Google Play Billing: planned for eligible Play distribution. Purchases must be verified server-side.
- Vercel: optional web landing page / admin console; not required by the Android editor.

Never commit API keys, signing keys, service-role secrets, or private credentials.
