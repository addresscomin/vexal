# SkyCut — Rebuild workspace

Isolated cross-platform editor rebuild. The existing Vexal website and the earlier prototype remain outside this workspace.

## Upstream projects pinned

The `sources/` directories are Git submodules pinned to upstream commits. The `vendor/` directories contain selected source files copied for direct integration, with upstream license files retained.

| Project | Imported source in this workspace | Intended contribution | License |
|---|---|---|---|
| LibreCuts | `vendor/librecuts/` | Android editor activity, project/edit models, ViewModels, trim/mask/transition UI, FFmpeg export engine | MIT |
| OpenScene | `vendor/openscene/` | Mobile timeline/project state, media library, export composition and native Android/iOS export modules | MIT |
| FreeCut | `vendor/freecut/` | Browser render core, export entry point, timeline/keyframe utilities and color-grade renderer | MIT |
| OpenCut | `vendor/opencut/` and `sources/opencut` | Rust desktop timeline, web editor route and FFmpeg setup reference | MIT |

The original upstream submodules remain available for inspecting additional modules and their dependency context.

## Platform targets

- **Android:** native Kotlin application, media import/preview, editing timeline and device export.
- **iOS:** native Swift/AVFoundation export with shared project interchange.
- **Desktop:** desktop editor shell and FFmpeg rendering.
- **Web:** browser editor and WebCodecs/WebGPU paths where supported.
- **Shared project document:** versioned assets, tracks, clips, timing, transforms, effects, titles, transitions and audio mix.

## Integration requirements

1. A control is not a feature until its operation changes the project and can be verified.
2. Editing operations must support undo/redo and persistent project save/reopen.
3. Preview and export must agree on clip timing, transforms, effects and audio.
4. Export must report unsupported effects instead of silently dropping them.
5. Media stays local unless the user explicitly chooses a cloud/AI feature.
6. Keep original upstream notices and audit nested dependency/asset licenses before distribution.

## Implementation sequence

1. Unify project/asset/track/clip schemas and project migration.
2. Integrate media import, multi-track playback, timeline selection and scrubbing.
3. Implement trim, split, ripple delete, duplicate, reorder, snapping, undo/redo and autosave.
4. Integrate audio tracks, waveforms, volume/fades, titles, subtitles, transitions and filters.
5. Build deterministic composition/export with progress, cancellation and output validation.
6. Add keyframes, masks, chroma key, tracking, motion graphics and advanced compositing.
7. Test parity and package Android, iOS, desktop and web builds.

**Status:** source modules are being integrated. This folder is not yet a completed or release-ready editor; each feature and platform must pass its own build and functional tests.
