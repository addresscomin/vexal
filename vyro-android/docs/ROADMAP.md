# VYRO implementation roadmap

This roadmap is deliberately honest about what is and is not implemented. The first repository commit establishes the Android app shell and interaction surfaces; it does not claim that a full NLE render engine is already present.

## Foundation (this commit)
- [x] Native Kotlin / Jetpack Compose application structure
- [x] Premium dark visual system, custom navigation treatment and iconography
- [x] Home, Studio, Effects and Pro screens
- [x] Android video document picker
- [ ] Device build + runtime verification

## Editing engine
- [ ] Media import, metadata probing, thumbnails and waveform generation
- [ ] Non-destructive project model and multi-track timeline
- [ ] Frame-accurate trim, split, reorder, crop, rotate and aspect ratios
- [ ] Playback preview and audio mixing
- [ ] Export pipeline, progress, cancellation and quality presets
- [ ] Text layers, captions, stickers, overlays and keyframe interpolation
- [ ] Speed curves, reverse, transitions, filters and color grading
- [ ] Chroma key / green-screen and background replacement
- [ ] Motion tracking / camera tracking with selectable tracking targets
- [ ] Stabilization and optical-flow features where device performance allows

## AI and effect packs
- [ ] Model-backed segmentation, object tracking and background removal
- [ ] Original shader-based effects and transitions
- [ ] Licensed asset packs, fonts, music and templates
- [ ] Offline fallback for core editing; clearly label cloud-dependent tools

## Cloud and product operations
- [ ] Supabase Auth, Postgres, Storage and strict Row Level Security
- [ ] Server-side subscription entitlement verification
- [ ] Google Play Billing for eligible Play distribution
- [ ] Crash reporting, privacy controls, backups and performance tests
- [ ] Optional Vercel landing page / admin console

## Non-negotiable quality rules
- Never bundle unlicensed music, fonts, templates, footage or copied competitor assets.
- Never expose Supabase service-role keys or billing secrets in the Android client.
- AI features must state when processing is on-device versus cloud-based.
- Test export quality, thermal load, memory use and low-storage behavior on real Android devices.
