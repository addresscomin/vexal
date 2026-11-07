import { assertValidProject, cloneProject } from "./project-model.mjs";

const EASINGS = new Set(["linear", "ease-in", "ease-out", "ease-in-out", "step"]);
function locate(project, trackId, clipId) {
  const track = project.tracks.find(t => t.id === trackId);
  const clip = track?.clips.find(c => c.id === clipId);
  if (!clip) throw new Error(`Clip not found: ${clipId}`);
  return clip;
}
function ease(t, kind) {
  if (kind === "ease-in") return t * t;
  if (kind === "ease-out") return 1 - (1 - t) * (1 - t);
  if (kind === "ease-in-out") return t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2;
  if (kind === "step") return 0;
  return t;
}
function mix(a, b, t) {
  if (typeof a === "number" && typeof b === "number") return a + (b-a)*t;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.map((v,i)=>mix(v,b[i],t));
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const out = {};
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) out[key] = key in a && key in b ? mix(a[key],b[key],t) : (t < 1 ? a[key] : b[key]);
    return out;
  }
  return t < 1 ? a : b;
}

export function setKeyframe(project, trackId, clipId, property, keyframe) {
  if (!property || typeof property !== "string") throw new TypeError("property is required");
  if (!keyframe || !Number.isFinite(keyframe.time) || keyframe.time < 0 || !EASINGS.has(keyframe.easing ?? "linear")) throw new RangeError("invalid keyframe");
  const next = cloneProject(project), clip = locate(next, trackId, clipId);
  if (keyframe.time > clip.duration) throw new RangeError("keyframe time exceeds clip duration");
  clip.keyframes ??= {};
  const frames = clip.keyframes[property] ?? [];
  const frame = { time: keyframe.time, value: structuredClone(keyframe.value), easing: keyframe.easing ?? "linear" };
  const index = frames.findIndex(k => Math.abs(k.time - frame.time) < 1e-9);
  if (index >= 0) frames[index] = frame; else frames.push(frame);
  frames.sort((a,b)=>a.time-b.time);
  clip.keyframes[property] = frames;
  next.metadata.updatedAt = new Date().toISOString();
  return assertValidProject(next);
}

export function removeKeyframe(project, trackId, clipId, property, time) {
  const next = cloneProject(project), clip = locate(next, trackId, clipId);
  const frames = clip.keyframes?.[property] ?? [];
  clip.keyframes ??= {};
  clip.keyframes[property] = frames.filter(k => Math.abs(k.time-time) >= 1e-9);
  next.metadata.updatedAt = new Date().toISOString();
  return assertValidProject(next);
}

export function evaluateKeyframes(clip, property, time, fallback) {
  const frames = [...(clip.keyframes?.[property] ?? [])].sort((a,b)=>a.time-b.time);
  if (!frames.length) return fallback;
  if (time <= frames[0].time) return structuredClone(frames[0].value);
  if (time >= frames.at(-1).time) return structuredClone(frames.at(-1).value);
  const rightIndex = frames.findIndex(k => k.time >= time);
  const left = frames[rightIndex-1], right = frames[rightIndex];
  const span = right.time-left.time;
  const progress = span <= 0 ? 1 : (time-left.time)/span;
  return mix(left.value, right.value, ease(progress, left.easing ?? "linear"));
}
