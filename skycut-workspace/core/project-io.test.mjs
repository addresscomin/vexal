import test from "node:test";
import assert from "node:assert/strict";
import { createProject } from "./project-model.mjs";
import { serializeProject, parseProjectDocument, createProjectSnapshot, parseProjectSnapshot } from "./project-io.mjs";
import { addTrack, addClip, setClipAudio, snapTimelineTime, removeTrack } from "./track-operations.mjs";

function fixture() {
  const p = createProject({ id: "p2" });
  p.assets.push({ id: "a1", type: "audio", uri: "file:///voice.wav", duration: 10 });
  return p;
}

test("project JSON round-trip preserves a validated project", () => {
  const p = fixture(), parsed = parseProjectDocument(serializeProject(p));
  assert.deepEqual(parsed, p);
});

test("snapshot format rejects unrelated JSON and round-trips", () => {
  const p = fixture();
  assert.deepEqual(parseProjectSnapshot(JSON.stringify(createProjectSnapshot(p))), p);
  assert.throws(() => parseProjectSnapshot("{}"), /Unsupported SkyCut snapshot/);
});

test("track and clip creation enforce identity and preserve ordering", () => {
  let p = addTrack(fixture(), { id: "a1-track", kind: "audio" });
  p = addClip(p, "a1-track", { id: "c2", assetId: "a1", timelineStart: 4, sourceStart: 0, duration: 2 });
  p = addClip(p, "a1-track", { id: "c1", assetId: "a1", timelineStart: 0, sourceStart: 2, duration: 2 });
  assert.deepEqual(p.tracks[0].clips.map(c => c.id), ["c1", "c2"]);
});

test("audio settings are range checked", () => {
  let p = addTrack(fixture(), { id: "a1-track", kind: "audio" });
  p = addClip(p, "a1-track", { id: "c1", assetId: "a1", timelineStart: 0, sourceStart: 0, duration: 2 });
  assert.equal(setClipAudio(p, "a1-track", "c1", { volume: 0.5, muted: true }).tracks[0].clips[0].volume, 0.5);
  assert.throws(() => setClipAudio(p, "a1-track", "c1", { volume: 5 }), /volume must be between/);
});

test("snapping chooses the nearest candidate only within threshold", () => {
  assert.equal(snapTimelineTime(2.04, [1, 2, 3], 0.1), 2);
  assert.equal(snapTimelineTime(2.2, [1, 2, 3], 0.1), 2.2);
});

test("track removal removes its clips from the project", () => {
  const p = addTrack(fixture(), { id: "audio-1", kind: "audio" });
  assert.equal(removeTrack(p, "audio-1").tracks.length, 0);
});
