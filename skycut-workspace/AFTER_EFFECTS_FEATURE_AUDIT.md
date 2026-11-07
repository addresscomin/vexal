# SkyCut — After Effects Feature Audit & Rebuild Specification

Status: research-backed product specification. This is not a claim that the current build has feature parity.

Reference basis: Adobe's public After Effects Help and Learn documentation, reviewed 2026-11-07. SkyCut will reproduce the professional editing workflow and interaction model with original implementation, code, assets, and branding.

## 1. Product goal

SkyCut is intended to be a serious After Effects-style motion graphics, compositing, animation, and visual-effects editor. The target is not a simplified social-video editor. The target workflow is:

Project -> Import footage -> Interpret footage -> Create compositions -> Build layer stacks -> Animate properties -> Add effects/masks/mattes -> Preview -> Render queue -> Export.

The product should feel familiar to After Effects users while retaining SkyCut identity. Do not claim feature parity until the relevant engine, UI, persistence, and tests are complete.

## 2. Workspace and panel map

### Global chrome
- Application menu: File, Edit, Composition, Layer, Effect, Animation, View, Window, Help.
- Tools bar: Selection, Hand, Zoom, Rotate, Camera tools, Shape tools, Pen, Text, Brush/Paint, Clone/Erase, Puppet tools where implemented.
- Workspace presets: Default, Animation, Effects, Color, Audio, Motion Tracking, 3D, Custom.
- Dockable/resizable panels, tab groups, panel focus state, panel menu, reset workspace, save custom workspace.
- Search/command palette and keyboard shortcut map.

### Primary panels
- Project: folders, footage, stills, audio, image sequences, solids, compositions, proxies, labels, metadata, search/filter, import and create buttons.
- Footage/Layer viewer: source-only view and footage trim; separate from final composition output.
- Composition viewer: active comp, overlays, guides, safe margins, grid, rulers, zoom, resolution, transparency grid, region of interest, camera view, fast preview quality.
- Timeline: one timeline per composition; layer stack; switches; modes; parenting; shy/solo/lock/shy; visibility/audio; 2D/3D; in/out points; work area; markers; time ruler; current-time indicator; property trees; keyframes; expressions; Graph Editor.
- Effect Controls: effect stack for selected layer, reorder, enable/disable, reset, animated parameters.
- Effects & Presets: searchable categorized effects, animation presets, favorites, user presets.
- Character/Essential Properties: editable controls for reusable graphics and templates.
- Audio: waveform, meters, audio properties/effects, preview controls.
- Tracker: point tracking, stabilize, track camera, mask tracking where engine support exists.
- Render Queue: multiple comp jobs, render settings, output module, destination, progress, cancel/retry, render history.
- Info, Preview, Align, Character, Paragraph, Brushes, Paint, Motion Sketch, Smoother, Wiggler and other utility panels as appropriate to supported features.

## 3. Footage import and interpretation

After selecting Import, SkyCut should support:
- Video, audio, still images, image sequences, vector artwork where supported, 3D models as a later phase.
- Multi-select, drag-and-drop, import folder, replace footage, reload footage, missing-media relink.
- Metadata: source dimensions, duration, frame rate, audio streams, codec/container where browser/runtime exposes it.
- Interpret footage: frame rate override, pixel aspect ratio, alpha interpretation, loop/hold settings, audio interpretation.
- Project organization: folders, labels, sort, search, duplicate footage item, proxy assignment.
- Create comp from footage: inherit dimensions, frame rate, pixel aspect and duration; add source as first layer.
- Footage viewer with source in/out range and audio preview.
- Asset references and durable media storage: project file must reopen without broken in-memory object URLs; use managed asset storage and relinking.

## 4. Composition system

Each composition owns:
- Name, width, height, pixel aspect ratio, frame rate, duration, start timecode/frame.
- Background, resolution/preview quality, color depth/working space, renderer settings.
- Its own ordered layer stack, timeline, work area, markers, camera/view settings.
- Nested compositions/precomps; duplicate, rename, delete, open and navigate parent/child comps.
- Presets for common landscape, portrait, square, UHD and custom sizes.
- Composition settings dialog and per-composition render settings.

## 5. Layer model

Layer types:
- Footage/video, audio, still, text, shape, solid, null, adjustment, camera, light, precomp, guide.
- Layer controls: select, rename, duplicate, delete, split, trim, slip, move in time, reorder, sequence, stretch/time remap, markers.
- Switches: visibility/video, audio, solo, lock, shy, guide, adjustment, 3D, motion blur, frame blending, collapse transformations/continuous rasterization, quality, sampling.
- Modes: blend mode, track matte (alpha/luma, inverted variants), parent/child links, preserve transparency.
- Layer properties: anchor point, position, scale, rotation, orientation, opacity, audio levels, time remap, masks, effects, text, shape, material/3D properties.
- Transform handles and bounding boxes in composition viewer.
- Adjustment layers affect the composite beneath them; null layers can act as parent controllers.

## 6. Animation system

- Property stopwatches; add/remove/update keyframes at current time.
- Numeric, vector, color, path and supported structured values.
- Linear, hold, bezier, auto-bezier, continuous bezier, roving spatial keyframes.
- Spatial motion paths and tangent handles.
- Easy Ease, temporal interpolation, speed/value graph modes, graph scaling and handles.
- Copy/paste, select, nudge, align, reverse, sequence and delete keyframes.
- Expressions editor with syntax highlighting, error reporting and a safe expression runtime. Never evaluate arbitrary untrusted code with eval/Function.
- Animation presets, keyframe assistant utilities, motion paths, parenting and constraints.
- Time remapping, frame blending and motion blur.
- Property search/reveal modified/reveal animated controls.

## 7. Effects, masks and compositing

- Effect browser with categorized built-in effects and presets; effect stack ordering matters.
- Effect parameters are first-class animatable properties and persist with the project.
- Core effects families: color correction, blur/sharpen, distortion, generate, keying, matte, noise/grain, perspective, stylize, time, transition, channel, audio.
- Masks: path, rectangle/ellipse/pen; add/subtract/intersect/none; feather, expansion, opacity; animated paths.
- Track mattes: alpha/luma and inverted variants.
- Blending modes and alpha compositing.
- Keying tools: chroma/luma key and matte cleanup.
- Roto/subject isolation and tracking are advanced engine-backed features, not merely UI buttons.
- Paint/brush/clone/eraser and puppet/deformation tools are later engine milestones.
- Render graph must define the actual order of source decode, masks, effects, transforms, mattes, blending and composition output.

## 8. Preview, audio and rendering

- Real-time/near-real-time composition preview, not just selected-clip playback.
- Preview range: work area, playhead, loop, skip frames, playback speed, resolution, cache state.
- RAM/disk frame cache with invalidation on edits; background frame preparation.
- Audio preview with scrubbing, waveform, audio levels and supported audio effects.
- Render Queue: enqueue multiple compositions, choose output dimensions/frame rate/quality/alpha/audio, output format, destination, progress and cancel.
- Export pipeline must use a real encoder/muxer and report exact supported formats. Never label WebM-only output as MP4.
- Project autosave, recovery, render failure diagnostics and resumable job metadata.

## 9. Current repository audit (verified from source on 2026-11-07)

Current web editor is still a prototype and is not feature-complete:
- React/Vite/Zustand app; main App.tsx is a monolithic component and styles are concentrated in one large stylesheet.
- Store has basic project assets, compositions, tracks, clips, transform values and numeric/vector keyframes.
- Existing compositor is a WebGL2 prototype and is not yet wired as the full composition renderer in the main App.
- A separate TimelineController exists with basic drag/trim/snap/zoom behaviour, but the main App timeline is not fully built around it.
- Existing preview is limited compared with a full multi-layer composition renderer.
- Export currently renders a selected video/image clip to WebM, not a complete composition render queue.
- Effects, masks, text, audio and track controls are partial. AI tools/templates are not real connected editing engines.
- Mobile is not yet a complete touch-first editor.

## 10. Rebuild phases and acceptance gates

### Phase A — Workspace shell (first)
- Replace the monolithic screen with modular panel components and a dockable/resizable workspace layout.
- Implement panel tabs, resize splitters, focus state, workspace presets, panel show/hide, reset layout.
- Acceptance: desktop workspace is stable at common laptop/desktop sizes; mobile has a deliberately different compact layout; all panels are actual components, not decorative placeholders.

### Phase B — Project and footage pipeline
- Asset bin, folders, import, metadata, interpretation, relink, source viewer, create-comp-from-footage.
- Acceptance: imported assets persist and can be reopened/relinked; composition settings match footage when requested.

### Phase C — Layer and timeline engine
- Per-composition layer stack, layer switches, modes, parenting, property trees, timeline editing and markers.
- Integrate one timeline controller into the actual App; remove duplicate/competing timeline implementations.
- Acceptance: drag/trim/slip/split/reorder/snap/undo operations update the same project document and survive reload.

### Phase D — Composition renderer
- Connect renderer to active composition; render every visible layer in correct order; support transforms, alpha, masks, mattes, blend modes and effects incrementally.
- Acceptance: viewer output matches deterministic render tests for multi-layer test projects.

### Phase E — Animation and effects
- Property model, keyframe editor, Graph Editor, expression sandbox, effect registry and animatable effect properties.
- Acceptance: interpolation, easing, effect parameters and project round-trip tests pass.

### Phase F — Audio, tracking and advanced tools
- Audio timeline and mixing, motion/mask tracking, keying, paint, puppet and 3D camera/light workflows as supported by the chosen runtime.
- Acceptance: each tool has a working engine implementation and test fixture before appearing as enabled.

### Phase G — Render queue and delivery
- Composition-wide render queue, encoder/muxer integration, format validation, output management and recovery.
- Acceptance: full composition exports with multiple layers and audio; no unsupported format claims.

## 11. Engineering rules

- Do not build UI controls for features that have no corresponding engine implementation. Unavailable advanced features must be disabled or clearly marked as planned.
- Every feature requires: domain model, UI, engine behaviour, persistence, undo/redo, validation and tests.
- Preserve Vexal's root website. All SkyCut changes stay inside skycut-workspace and the dedicated preview publishing folder.
- Do not copy Adobe source code, proprietary assets, icons, or trademarks. Reproduce the workflow using original code and SkyCut branding.
