# SkyCut shared timeline core

Platform-neutral project document and deterministic edit operations. This module uses native JavaScript modules so it can be exercised with Node's built-in test runner before platform adapters are connected.

Run tests:

```sh
node --test skycut-workspace/core/*.test.mjs
```

Current operations: project validation, split, trim, ripple delete, duplicate, move, track reorder and bounded undo/redo snapshots. This is a foundation module, not yet wired into Android/iOS/desktop/web UI or render adapters.
