# SkyCut shared timeline core

Platform-neutral project document and deterministic editing operations. Native JavaScript modules keep the core independent of a UI framework and allow it to be tested with Node's built-in runner.

Run tests:

```sh
node --test skycut-workspace/core/*.test.mjs
```

## Implemented and tested

- Versioned project creation, validation, JSON serialization and snapshot round-trip.
- Track add/remove and clip add with identity checks.
- Split with source-time continuity (including playback rate).
- Non-destructive trim in/out.
- Ripple delete on the affected track.
- Duplicate and move clips.
- Track reorder.
- Clip audio volume/mute controls and bounds validation.
- Timeline snapping to nearby candidate positions.
- Bounded undo/redo snapshot history.

## Not yet connected

This is the shared domain foundation. It is not yet wired into Android/iOS/desktop/web UI, real media decoding, preview synchronization or render adapters. Those integrations must be implemented and tested before calling the editor release-ready.
