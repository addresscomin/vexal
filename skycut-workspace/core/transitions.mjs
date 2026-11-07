import { assertValidProject, cloneProject } from "./project-model.mjs";

const TYPES = new Set(["crossfade", "dip-to-black", "wipe", "slide"]);
export function addTransition(project, trackId, fromClipId, toClipId, { id, type = "crossfade", duration = 0.5, easing = "linear" } = {}) {
  if (!id) throw new TypeError("transition id is required");
  if (!TYPES.has(type)) throw new TypeError("unsupported transition type");
  if (!Number.isFinite(duration) || duration <= 0) throw new RangeError("transition duration must be positive");
  const next = cloneProject(project), track = next.tracks.find(t=>t.id===trackId);
  if (!track) throw new Error(`Track not found: ${trackId}`);
  const from = track.clips.find(c=>c.id===fromClipId), to = track.clips.find(c=>c.id===toClipId);
  if (!from || !to) throw new Error("both transition clips must exist on the same track");
  if (fromClipId === toClipId) throw new Error("transition requires two different clips");
  if (duration > Math.min(from.duration, to.duration)) throw new RangeError("transition cannot exceed either clip duration");
  track.transitions ??= [];
  if (track.transitions.some(t=>t.id===id || (t.fromClipId===fromClipId && t.toClipId===toClipId))) throw new Error("transition already exists for this clip pair");
  const boundary = from.timelineStart + from.duration;
  if (Math.abs(to.timelineStart-boundary) > 1/next.settings.fps + 1e-6) throw new Error("transition clips must be adjacent on the timeline");
  track.transitions.push({ id, type, fromClipId, toClipId, duration, easing, timelineStart: boundary-duration/2 });
  next.metadata.updatedAt = new Date().toISOString();
  return assertValidProject(next);
}

export function removeTransition(project, trackId, transitionId) {
  const next = cloneProject(project), track = next.tracks.find(t=>t.id===trackId);
  if (!track) throw new Error(`Track not found: ${trackId}`);
  track.transitions = (track.transitions ?? []).filter(t=>t.id!==transitionId);
  next.metadata.updatedAt = new Date().toISOString();
  return assertValidProject(next);
}
