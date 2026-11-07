import { assertValidProject, cloneProject } from "./project-model.mjs";

function locate(project, trackId, clipId) {
  const trackIndex = project.tracks.findIndex(t => t.id === trackId);
  if (trackIndex < 0) throw new Error(`Track not found: ${trackId}`);
  const clipIndex = project.tracks[trackIndex].clips.findIndex(c => c.id === clipId);
  if (clipIndex < 0) throw new Error(`Clip not found: ${clipId}`);
  return { trackIndex, clipIndex, clip: project.tracks[trackIndex].clips[clipIndex] };
}
function clean(project) { project.metadata.updatedAt = new Date().toISOString(); return assertValidProject(project); }

export function splitClip(project, trackId, clipId, at) {
  const next = cloneProject(project), { trackIndex, clipIndex, clip } = locate(next, trackId, clipId);
  const end = clip.timelineStart + clip.duration;
  if (!Number.isFinite(at) || at <= clip.timelineStart || at >= end) throw new RangeError("split point must be inside the clip");
  const leftDuration = at - clip.timelineStart, rightDuration = end - at;
  const right = { ...clip, id: `${clip.id}:split:${Math.round(at * 1000)}`, timelineStart: at,
    sourceStart: clip.sourceStart + leftDuration * clip.playbackRate, duration: rightDuration,
    linkGroupId: clip.linkGroupId ?? clip.id };
  next.tracks[trackIndex].clips[clipIndex] = { ...clip, duration: leftDuration, linkGroupId: clip.linkGroupId ?? clip.id };
  next.tracks[trackIndex].clips.splice(clipIndex + 1, 0, right);
  return clean(next);
}

export function trimClip(project, trackId, clipId, { start, end } = {}) {
  const next = cloneProject(project), { trackIndex, clipIndex, clip } = locate(next, trackId, clipId);
  const oldEnd = clip.timelineStart + clip.duration;
  const newStart = start ?? clip.timelineStart, newEnd = end ?? oldEnd;
  if (!Number.isFinite(newStart) || !Number.isFinite(newEnd) || newStart < clip.timelineStart || newEnd > oldEnd || newEnd <= newStart)
    throw new RangeError("trim range must be inside the current clip");
  const delta = newStart - clip.timelineStart;
  next.tracks[trackIndex].clips[clipIndex] = { ...clip, timelineStart: newStart,
    sourceStart: clip.sourceStart + delta * clip.playbackRate, duration: newEnd - newStart };
  return clean(next);
}

export function rippleDelete(project, trackId, clipId) {
  const next = cloneProject(project), { trackIndex, clipIndex, clip } = locate(next, trackId, clipId);
  const removedDuration = clip.duration;
  next.tracks[trackIndex].clips.splice(clipIndex, 1);
  next.tracks[trackIndex].clips = next.tracks[trackIndex].clips.map(c =>
    c.timelineStart >= clip.timelineStart + removedDuration - 1e-9
      ? { ...c, timelineStart: Math.max(0, c.timelineStart - removedDuration) } : c);
  return clean(next);
}

export function duplicateClip(project, trackId, clipId, { newId, timelineStart } = {}) {
  if (!newId) throw new TypeError("newId is required");
  const next = cloneProject(project), { trackIndex, clipIndex, clip } = locate(next, trackId, clipId);
  if (next.tracks.some(t => t.clips.some(c => c.id === newId))) throw new Error(`clip id already exists: ${newId}`);
  const copy = { ...clip, id: newId, timelineStart: timelineStart ?? clip.timelineStart + clip.duration };
  next.tracks[trackIndex].clips.splice(clipIndex + 1, 0, copy);
  return clean(next);
}

export function moveClip(project, trackId, clipId, timelineStart) {
  if (!Number.isFinite(timelineStart) || timelineStart < 0) throw new RangeError("timelineStart must be >= 0");
  const next = cloneProject(project), { trackIndex, clipIndex, clip } = locate(next, trackId, clipId);
  next.tracks[trackIndex].clips.splice(clipIndex, 1);
  next.tracks[trackIndex].clips.push({ ...clip, timelineStart });
  next.tracks[trackIndex].clips.sort((a,b) => a.timelineStart - b.timelineStart);
  return clean(next);
}

export function reorderTrack(project, trackId, fromIndex, toIndex) {
  const next = cloneProject(project);
  const from = next.tracks.findIndex(t => t.id === trackId);
  if (from < 0) throw new Error(`Track not found: ${trackId}`);
  if (!Number.isInteger(toIndex) || toIndex < 0 || toIndex >= next.tracks.length) throw new RangeError("invalid target track index");
  const [track] = next.tracks.splice(from, 1);
  next.tracks.splice(toIndex, 0, track);
  return clean(next);
}
