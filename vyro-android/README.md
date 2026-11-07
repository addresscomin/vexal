# VYRO — Mobile Video Editor

VYRO is an original Android-first video editor project. It is developed independently and does not copy CapCut or After Effects source code, branding, proprietary effects, templates, or assets.

## Current Android foundation
- Premium dark visual system, custom bottom navigation and icon treatment
- Home / project hub, Studio workspace, Effects library and Pro screen
- Android document picker for video import
- Media3 ExoPlayer video preview in the Studio screen
- Non-destructive clip / track / transform project models
- Timeline split, trim-start, trim-end, speed and volume model operations
- First Media3 Transformer export path for a single trimmed / rotated clip
- GitHub Actions workflow configured to build a debug APK

## Open the project
Open `vyro-android/` in Android Studio with JDK 17 and Android SDK 35. The CI workflow uses Gradle 8.9.

## Build
```bash
gradle -p vyro-android assembleDebug
```

The expected debug APK output is:
`vyro-android/app/build/outputs/apk/debug/app-debug.apk`

## Feature plans
See:
- `docs/FEATURE-MATRIX.md` — broad mobile editor and motion-graphics feature specification
- `docs/ROADMAP.md` — implementation milestones and status
- `app/src/main/java/studio/zahd/vyro/editor/` — timeline model and Media3 export foundation

## Cloud setup
A Supabase schema draft is in `supabase/migrations/`. It has not been applied to a live project. Cloud sync, storage buckets, authentication and server-verified subscriptions need a separately authorized Supabase project and deployment configuration.

## Honest implementation status
This is an active foundation build, not yet a complete production editor. Multi-track compositing, full timeline UI, audio mixing, chroma key, masks, keyframe rendering, background removal, motion/camera tracking, captions and full export UI still require implementation and device testing. The feature matrix does not imply those tools are already operational.

Never commit API keys, service-role secrets, billing credentials, signing keys, or private user media.
