# VYRO feature matrix — original implementation plan

VYRO takes inspiration from the *categories* of tools used by modern mobile editors and desktop compositors. It does not copy competitor code, UI assets, templates, branding, proprietary presets, or protected content.

## Import and project
- Device gallery / document import, multi-select and media bin
- Project presets: 9:16, 16:9, 1:1, 4:5, custom canvas and frame rate
- Autosave, undo/redo history, proxy media and relink missing files

## Timeline and clip properties
- Multi-track video, overlay, image, audio, text, sticker and effect layers
- Frame-accurate trim, split, duplicate, reorder, ripple delete, snapping and markers
- Clip properties: position, scale, rotation, opacity, anchor, crop, flip, blend mode
- Speed controls, speed curves, reverse, freeze frame and time remapping
- Audio gain, mute, fades, waveform, voiceover, music and sound effects

## Motion graphics and compositing
- Keyframes with easing curves and editable animation paths
- Masks: rectangle, ellipse, freeform; feather, expansion, inversion and keyframes
- Chroma key with color picker, tolerance, edge feather and spill suppression
- Picture-in-picture, overlays, blend modes, nested compositions and title layers
- Motion tracking for attaching titles/graphics to tracked objects
- Camera motion estimation / 3D camera solve is a separate advanced milestone

## Image and color
- Exposure, contrast, saturation, temperature, tint, highlights, shadows and curves
- HSL controls, LUT import, vignette, sharpen, blur, glow, grain and distortion
- Crop, perspective, rotate, mirror and background canvas

## Audio and captions
- Multi-layer audio, fades, EQ, ducking, voiceover and sync tools
- Auto captions, subtitle import/export and editable typography

## AI-assisted tools
- Subject segmentation / background removal, object tracking and speech transcription
- On-device first where feasible; cloud processing only with clear consent and privacy controls
- AI tools must disclose device/cloud processing and avoid sending user media without consent

## Export and quality
- MP4 export, resolution / frame-rate / bitrate presets, progress and cancellation
- Thermal/memory guardrails, low-storage handling and real-device compatibility tests

## Desktop-compositor-inspired tools
- Layer stack, parenting, anchor points, graph-style keyframe easing, masks, mattes,
  blend modes, motion tracking, color effects, particle systems and reusable presets
- 3D camera tracking, advanced rotoscoping, optical-flow retiming and complex particle
  simulation require dedicated native/GPU/ML implementation and cannot be treated as a
  simple switch or assumed available on every Android device.

## Build status
This is a product specification, not a claim that every item is already implemented.
