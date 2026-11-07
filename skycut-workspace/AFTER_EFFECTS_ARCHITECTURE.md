# SkyCut — After Effects-Inspired Architecture Blueprint

Status: architecture baseline, not a claim of feature parity with Adobe After Effects.

## 1. Product boundary
SkyCut is an original layer-based motion-graphics and compositing editor. A Project contains media assets and one or more Compositions. Each Composition owns its frame rate, dimensions, color settings, ordered layers, markers, work area and render settings. A Layer is an instance of a source (footage, still, audio, text, shape, solid, generated content or nested composition) and owns timing, transforms, masks, blend mode, effects and animated properties.

Adobe's private implementation is not public. This blueprint follows public workflows and documented concepts, without copying proprietary source code, branding or assets.

## 2. UI architecture
Desktop workspace: application/menu bar; tools; Project panel; Composition viewer; Timeline; Properties and Effect Controls; Effects & Presets; Preview controls; Render Queue; dockable/resizable panel manager and saved workspace presets.

Project panel handles folders, compositions, footage, search, metadata, import and interpretation. Composition viewer handles current frame, overlays, guides, transparency grid, zoom and preview resolution. Timeline handles layer order, switches, in/out points, parenting, markers, property disclosure, keyframes, work area and Graph Editor. Render Queue handles composition, range, output format, destination, progress, cancellation and errors.

Mobile is a separate touch-first workspace, not a squashed desktop UI: viewer-first canvas, horizontally scrollable/pinch-zoom timeline, contextual property sheets, compact asset/effect drawers, touch-safe gestures and background export status. Desktop and mobile share the document model and engine contracts.

## 3. Document model
Project: id, name, schema version, frame rate, color profile, bit depth, asset registry, composition registry, folders and workspace metadata.
Composition: id, name, dimensions, pixel aspect, frame rate, duration/work area, background, color settings, ordered layers, markers and render settings.
Layer: id, name, type, source id, enabled/solo/locked/shy/audio switches, blend mode, parent id, start/in/out frames, stretch, transform, masks, effect stack and typed properties.
Sources: footage, text, shape, solid, nested composition and generated source. A source asset is not a timeline layer; the same source can be instanced by many layers and compositions.
AnimatedProperty: typed value, keyframes, interpolation/easing, spatial tangents, validation and serialization. Expressions are a future isolated capability.
Effect: stable type/version, enabled state, typed parameters, declared input/output color space, render implementation, CPU/GPU capability and serialization migration.

## 4. Engine services
1. Document Service — create/open/save, version migration, autosave, undo/redo transactions.
2. Asset Service — import, metadata probing, thumbnails, waveforms, proxies, relink and deduplication.
3. Timeline Service — frame-accurate timebase, layer ordering, trim/slip/move, snapping, markers, parenting and ripple operations.
4. Animation Service — typed properties, keyframe interpolation, temporal/spatial Bézier, graph curves and easing.
5. Composition Graph — nested compositions, dependency graph, cycle detection and invalidation propagation.
6. Render Graph — source decode, interpretation, masks, effects, transforms, blending, color management and output.
7. Preview Scheduler — interactive quality, frame cache, playback clock, dropped-frame handling and proxy resolution.
8. Audio Engine — decode, source offsets, gain, pan, fades, mute/solo, track mixing, waveform and synchronized preview.
9. Export Engine — frame-range evaluation, audio mix, frame rendering, encoding, muxing, progress, cancellation and output verification.
10. Extension Host — versioned effect/tool contracts and capability permissions, later phase.

## 5. Compositing contract
Initial 2D pipeline: source decode and interpretation → source-space masks → ordered effect stack → layer transform (anchor, position, scale, rotation) → layer-space mask/matte → color conversion and alpha handling → blend into composition target in layer order → composition output transform → preview or encoder.
Effects may declare a pre-transform or post-transform stage. The order must be explicit and testable, not hidden inside UI components.
Required correctness: premultiplied alpha, opacity, blend modes, transparent render targets, nested composition surfaces, mask paths/feather/expansion/inversion, adjustment layers and deterministic output independent of UI selection.

## 6. Media/render technology
Decode: WebCodecs where supported, HTML media fallback for preview, ImageBitmap for stills. GPU: WebGL2 baseline behind an abstraction; evaluate WebGPU after capability testing; CPU fallback for unsupported devices and deterministic tests. Audio: Web Audio graph. Encode: WebCodecs where supported plus a tested native/server encoder path for formats browsers cannot reliably encode. Do not promise MP4/H.264 until encoder and muxer are integrated and tested.
Use Web Workers for probing, thumbnails, waveform generation, frame preparation and export orchestration. Maintain decoded-frame, effect-intermediate, composition-frame, thumbnail and waveform caches with revision/dependency-based invalidation.

## 7. Persistence and backend
Basic editing does not require a remote backend. Default is local-first: IndexedDB for browser project metadata/media, explicit project package import/export, autosave snapshots, recovery journal and quota handling.
Optional cloud services later: authentication, project metadata, object storage, sync/version history, conflict resolution, remote render-job API/worker queue and subscription entitlements. Cloud must never be required to open/edit a local project. Do not upload user media without clear action and disclosure.

## 8. Repository boundaries
packages/document — schemas, validation, migrations, serialization.
packages/timeline — frame math, editing operations, snapping and markers.
packages/animation — typed properties, keyframes and interpolation.
packages/render-core — render graph contracts and deterministic compositor.
packages/media — import, probe, decode, cache and audio.
packages/effects — effect registry and built-in effects.
packages/export — render queue, frame pipeline, encoders and muxers.
apps/web — desktop web workspace and mobile web experience.
apps/desktop — desktop shell and native file access.
apps/android — native Android shell/media pipeline and touch editor.
services/cloud — optional sync, storage and render jobs.
UI components call domain services/store actions; rendering, time math and persistence do not live inside React components.

## 9. Current repository audit (2026-11-07)
React/Vite/TypeScript and Zustand are present. Project state includes assets, tracks, clips, keyframes and undo/redo. IndexedDB media persistence exists. TimelineController is separate but the main App renders a different timeline implementation. EngineCompositor exists but is not integrated into the main preview; its current shader path does not yet implement the complete blend/mask/transform/effect pipeline. Preview logic is mainly selected-clip/DOM based, not a deterministic full-composition renderer. Keyframes cover opacity, position, scale and rotation in the UI, but typed properties and a full Graph Editor are incomplete. Export is a limited browser recording path, not a composition render queue with reliable audio mixing and production codec/muxing. A complete cloud backend and native Android SkyCut editing pipeline are not established.

## 10. Rebuild phases and acceptance gates
Phase A — Document foundation: project/composition/layer/source model, migration, typed properties, transaction undo/redo. Gate: create/save/reopen multi-composition project without data loss.
Phase B — Timeline/animation: one integrated timeline, layer switches, parenting, markers, work area, trim/slip/move, keyframe lanes and Graph Editor. Gate: frame-math tests and reliable multi-layer edits.
Phase C — Compositor: render graph, source decode, transforms, masks, blend modes, effects, adjustment layers and nested compositions. Gate: deterministic reference-frame tests.
Phase D — Audio/preview: multi-track audio graph, sync clock, cache, preview quality and waveform. Gate: synchronized playback and reliable seeking.
Phase E — Export: composition render queue, frame range, audio mix, encoder/muxer, progress/cancel/retry. Gate: exported file reopens with verified duration, frame count and audio sync.
Phase F — Productization: workspace persistence, shortcuts, touch UX, crash recovery, accessibility and device capability profiles. Gate: desktop and Android device test matrix.
Phase G — Optional cloud: auth, sync, asset storage and remote rendering after local editing is reliable. Gate: offline editing and recoverable sync conflicts.

## 11. Engineering rules
Never report a feature complete based only on a visible control. Every feature needs domain implementation, UI integration, persistence, tests and a working preview/export path where applicable. Every commit must pass typecheck and build; rendering changes also need reference tests. Keep the existing Vexal root site untouched. SkyCut source changes stay on skycut-rebuild; preview publishing may update only skycut-preview/.
