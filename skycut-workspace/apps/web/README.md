# SkyCut web editor foundation

React 19 + TypeScript 5 + Zustand editor-domain foundation.

Install and typecheck:

```sh
npm install
npm run typecheck
```

The current source includes an immutable Zustand project store, frame-based edit actions, Bezier keyframe sampling, a WebGL2 media-layer preview loop and a pointer-driven timeline controller. This is not yet the complete desktop/web editor: docking, virtualized 500-track rendering, full blend-mode ping-pong composition, WebGPU, WASM FFmpeg, AI workers, cloud render services and end-to-end media/export parity remain separate integration work.
