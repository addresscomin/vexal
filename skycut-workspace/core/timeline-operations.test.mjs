import test from "node:test";
import assert from "node:assert/strict";
import { createProject, validateProject } from "./project-model.mjs";
import { splitClip, trimClip, rippleDelete, duplicateClip, moveClip } from "./timeline-operations.mjs";
import { createProjectHistory } from "./project-history.mjs";

function fixture() {
  const p = createProject({ id: "p1", fps: 30 });
  p.assets.push({ id: "a1", type: "video", uri: "file:///a.mp4", duration: 20 });
  p.tracks.push({ id: "v1", kind: "video", name: "Video 1", clips: [
    { id: "c1", assetId: "a1", timelineStart: 0, sourceStart: 2, duration: 8, playbackRate: 1, volume: 1 },
    { id: "c2", assetId: "a1", timelineStart: 8, sourceStart: 10, duration: 4, playbackRate: 1, volume: 1 }
  ]});
  return p;
}

test("split preserves source-time continuity and total duration", () => {
  const p = splitClip(fixture(), "v1", "c1", 3);
  assert.equal(p.tracks[0].clips[0].duration, 3);
  assert.equal(p.tracks[0].clips[1].sourceStart, 5);
  assert.equal(p.tracks[0].clips[1].duration, 5);
  assert.deepEqual(validateProject(p), []);
});

test("trim start advances source time and trim end shortens duration", () => {
  const p = trimClip(fixture(), "v1", "c1", { start: 2, end: 6 });
  assert.equal(p.tracks[0].clips[0].sourceStart, 4);
  assert.equal(p.tracks[0].clips[0].duration, 4);
});

test("ripple delete closes the gap on the same track", () => {
  const p = rippleDelete(fixture(), "v1", "c1");
  assert.equal(p.tracks[0].clips.length, 1);
  assert.equal(p.tracks[0].clips[0].timelineStart, 0);
});

test("duplicate creates a new clip after the source clip", () => {
  const p = duplicateClip(fixture(), "v1", "c1", { newId: "c3" });
  assert.equal(p.tracks[0].clips[1].id, "c3");
  assert.equal(p.tracks[0].clips[1].timelineStart, 8);
});

test("move updates timeline position without changing source in/out", () => {
  const p = moveClip(fixture(), "v1", "c1", 12);
  const moved = p.tracks[0].clips.find(c => c.id === "c1");
  assert.equal(moved.timelineStart, 12);
  assert.equal(moved.sourceStart, 2);
});

test("history supports undo and redo with isolated snapshots", () => {
  const p = fixture(), h = createProjectHistory(p);
  const edited = splitClip(p, "v1", "c1", 4);
  h.commit(edited);
  assert.equal(h.current.tracks[0].clips.length, 3);
  assert.equal(h.undo().tracks[0].clips.length, 2);
  assert.equal(h.redo().tracks[0].clips.length, 3);
});
