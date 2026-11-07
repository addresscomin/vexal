import { assertValidProject, cloneProject } from "./project-model.mjs";

function update(project) { project.metadata.updatedAt = new Date().toISOString(); return assertValidProject(project); }

export function addTrack(project, { id, kind, name, muted = false, locked = false } = {}) {
  if (!id || !["video", "audio", "overlay"].includes(kind)) throw new TypeError("track id and supported kind are required");
  const next = cloneProject(project);
  if (next.tracks.some(t => t.id === id)) throw new Error(`track id already exists: ${id}`);
  next.tracks.push({ id, kind, name: name ?? `${kind} track`, muted, locked, clips: [] });
  return update(next);
}

export function removeTrack(project, trackId) {
  const next = cloneProject(project), index = next.tracks.findIndex(t => t.id === trackId);
  if (index < 0) throw new Error(`Track not found: ${trackId}`);
  next.tracks.splice(index, 1);
  return update(next);
}

export function addClip(project, trackId, clip) {
  const next = cloneProject(project), track = next.tracks.find(t => t.id === trackId);
  if (!track) throw new Error(`Track not found: ${trackId}`);
  if (track.locked) throw new Error("Cannot edit a locked track");
  if (next.tracks.some(t => t.clips.some(c => c.id === clip.id))) throw new Error(`clip id already exists: ${clip.id}`);
  track.clips.push({ playbackRate: 1, volume: 1, ...clip });
  track.clips.sort((a,b) => a.timelineStart - b.timelineStart);
  return update(next);
}

export function setClipAudio(project, trackId, clipId, { volume, muted } = {}) {
  const next = cloneProject(project), track = next.tracks.find(t => t.id === trackId);
  const clip = track?.clips.find(c => c.id === clipId);
  if (!clip) throw new Error(`Clip not found: ${clipId}`);
  if (volume !== undefined && (!Number.isFinite(volume) || volume < 0 || volume > 4)) throw new RangeError("volume must be between 0 and 4");
  if (volume !== undefined) clip.volume = volume;
  if (muted !== undefined) clip.muted = Boolean(muted);
  return update(next);
}

export function snapTimelineTime(time, candidates, threshold = 0.12) {
  if (!Number.isFinite(time) || !Number.isFinite(threshold) || threshold < 0) throw new RangeError("invalid snap arguments");
  let best = time, distance = threshold;
  for (const candidate of candidates) {
    const delta = Math.abs(candidate - time);
    if (Number.isFinite(candidate) && delta <= distance) { best = candidate; distance = delta; }
  }
  return best;
}
