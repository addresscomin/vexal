# SkyCut — Rebuild workspace

This is the new, isolated SkyCut rebuild workspace. The existing Vexal site and the earlier prototype are preserved outside this folder.

## Source projects pinned for integration

Run `git submodule update --init --recursive` after cloning this repository to fetch the pinned upstream source trees.

| Source | Role in SkyCut | License |
|---|---|---|
| OpenScene | Desktop shell, shared timeline/editor domain, React Native integration patterns | MIT |
| LibreCuts | Android-native editing and export implementation reference | MIT |
| FreeCut | Browser multi-track editing, keyframes and WebGPU/WebCodecs reference | MIT |
| OpenCut | Browser editor architecture and Rust/WASM direction | MIT |

Upstream code remains in its own submodule directory with its original copyright and license files. Changes to upstream code should be made as clearly documented patches or maintained forks; do not erase attribution.

## Platform plan

- **Web:** React/TypeScript editor surface; local-first media and browser rendering where supported.
- **Desktop:** desktop shell around the shared project/timeline model, with native FFmpeg rendering.
- **Android:** native media import, preview, timeline controls and Media3-based export.
- **iOS:** native AVFoundation rendering.
- **Shared project format:** versioned timeline document with assets, tracks, clip timing, transforms, effects, titles, transitions and audio mix.

## Integration rules

1. A feature is not complete merely because a button or panel exists.
2. Every edit operation must update the shared project model and support undo/redo.
3. Preview and export must use equivalent effect/transform semantics.
4. Unsupported operations must be clearly identified before export; never silently omit layers or audio.
5. Keep media local by default. No upload or AI-provider call without an explicit user action.
6. Preserve all third-party notices and satisfy each upstream license when distributing binaries or source.

## Initial feature integration order

1. Project/media library, multi-track timeline, clip selection and playback.
2. Split, trim, ripple delete, duplicate, reorder, snapping, undo/redo and autosave.
3. Audio tracks, volume/fades, titles/subtitles, transitions and filters.
4. Composition/export pipeline with progress, cancellation and output validation.
5. Keyframes, masks, chroma key, tracking, motion graphics and advanced compositing.
6. Desktop/mobile parity, project interchange and automated regression tests.

This workspace is a source integration baseline, not a claim that all listed capabilities are already implemented.
