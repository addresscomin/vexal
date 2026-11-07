# VYRO implementation roadmap

VYRO is an original mobile-first editing and motion-graphics studio. Feature references from other editors are used only to understand workflows and capability categories; VYRO will use original UI, parameter models, shaders, and licensed assets.

## Foundation
- [x] Native Kotlin / Jetpack Compose application structure
- [x] Premium dark visual system and primary screens
- [x] Android video document picker
- [x] Non-destructive clip and timeline data models
- [x] First Media3 single-clip trim/rotation export path
- [x] Initial effect definition and parameter-stack model
- [ ] Device build + runtime verification

## Editing engine
- [ ] Media import, metadata probing, thumbnails and waveform generation
- [ ] Frame-accurate multi-track timeline with undo/redo
- [ ] Playback preview and audio mixing
- [ ] Export pipeline, progress, cancellation and quality presets
- [ ] Text layers, captions, stickers, overlays and keyframe interpolation
- [ ] Speed curves, reverse, transitions, filters and color grading
- [ ] Chroma key / green-screen and background replacement

## Motion graphics and VFX
- [ ] GPU effect renderer with preview/export parity
- [ ] Effect stack UI with keyframable parameters and presets
- [ ] Color Lab: curves, levels, HSL, wheels, scopes and selective correction
- [ ] Light FX: glow, bloom, sweep, flare and procedural rays
- [ ] Motion FX: shutter blur, echo/trails, radial/directional blur and warp
- [ ] Particle Studio: emitters, forces, turbulence and particle presets
- [ ] Graph editor, motion paths, parenting and null layers
- [ ] Masking, track mattes, blend modes and assisted rotoscoping

## Tracking and 3D
- [ ] Point/object tracking with attach-to-target workflow
- [ ] Planar tracking for screen and surface replacement
- [ ] 3D camera solve and camera/layer coordinate conversion
- [ ] 3D layers, camera, lights and depth-aware compositing
- [ ] Stabilization and optical-flow features where device performance allows

## AI and product operations
- [ ] Model-backed segmentation, object tracking and background removal
- [ ] Offline fallback for core editing; clearly label cloud-dependent tools
- [ ] Licensed fonts, music, templates and asset packs
- [ ] Supabase Auth, Postgres, Storage and strict Row Level Security
- [ ] Server-side subscription entitlement verification
- [ ] Crash reporting, privacy controls, backups and performance tests

## Quality and licensing rules
- Never bundle unlicensed music, fonts, templates, footage or copied competitor assets.
- Do not copy proprietary plugins, source code, branding, or preset assets.
- Every effect must have a real preview and export implementation before being marked available.
- Never expose Supabase service-role keys or billing secrets in the Android client.
- Test export quality, thermal load, memory use and low-storage behavior on real Android devices.
