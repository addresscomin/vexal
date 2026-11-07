import test from "node:test";
import assert from "node:assert/strict";
import { createProject } from "./project-model.mjs";
import { setKeyframe, removeKeyframe, evaluateKeyframes } from "./keyframes.mjs";

function fixture() {
  const p = createProject({ id: "keyframe-project" });
  p.assets.push({ id: "asset", type: "video", uri: "file:///clip.mp4", duration: 10 });
  p.tracks.push({ id: "video", kind: "video", clips: [
    { id: "clip", assetId: "asset", timelineStart: 0, sourceStart: 0, duration: 5, playbackRate: 1, volume: 1 }
  ]});
  return p;
}

test("keyframes are inserted in time order and sampled linearly", () => {
  let p = setKeyframe(fixture(), "video", "clip", "opacity", { time: 4, value: 1 });
  p = setKeyframe(p, "video", "clip", "opacity", { time: 0, value: 0 });
  const clip = p.tracks[0].clips[0];
  assert.deepEqual(clip.keyframes.opacity.map(k=>k.time), [0,4]);
  assert.equal(evaluateKeyframes(clip, "opacity", 2), .5);
});

test("keyframe easing is applied between points", () => {
  let p = setKeyframe(fixture(), "video", "clip", "position", { time: 0, value: [0,0], easing: "ease-in" });
  p = setKeyframe(p, "video", "clip", "position", { time: 2, value: [100,50] });
  assert.deepEqual(evaluateKeyframes(p.tracks[0].clips[0], "position", 1), [25,12.5]);
});

test("keyframe at the same timestamp replaces existing value", () => {
  let p = setKeyframe(fixture(), "video", "clip", "scale", { time: 1, value: 1 });
  p = setKeyframe(p, "video", "clip", "scale", { time: 1, value: 2 });
  assert.equal(p.tracks[0].clips[0].keyframes.scale.length, 1);
  assert.equal(evaluateKeyframes(p.tracks[0].clips[0], "scale", 1), 2);
});

test("keyframes outside clip duration are rejected and can be removed", () => {
  assert.throws(()=>setKeyframe(fixture(), "video", "clip", "rotation", { time: 6, value: 90 }), /exceeds clip duration/);
  const p = setKeyframe(fixture(), "video", "clip", "rotation", { time: 2, value: 90 });
  const next = removeKeyframe(p, "video", "clip", "rotation", 2);
  assert.equal(next.tracks[0].clips[0].keyframes.rotation.length, 0);
});
