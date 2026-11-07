export const PROJECT_SCHEMA_VERSION = 1;

export function createProject({ id, name = "Untitled project", width = 1920, height = 1080, fps = 30 } = {}) {
  if (!id) throw new TypeError("project id is required");
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) throw new RangeError("invalid canvas size");
  if (!Number.isFinite(fps) || fps <= 0 || fps > 240) throw new RangeError("fps must be between 0 and 240");
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    id, name, settings: { width, height, fps, audioSampleRate: 48000 },
    assets: [], tracks: [], metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  };
}

export function validateProject(project) {
  const errors = [];
  if (!project || typeof project !== "object") return ["project must be an object"];
  if (project.schemaVersion !== PROJECT_SCHEMA_VERSION) errors.push("unsupported schemaVersion");
  if (!project.id || typeof project.id !== "string") errors.push("project id is required");
  if (!project.settings || !Number.isFinite(project.settings.fps) || project.settings.fps <= 0) errors.push("valid project fps is required");
  const assetIds = new Set();
  for (const asset of project.assets ?? []) {
    if (!asset.id || assetIds.has(asset.id)) errors.push(`duplicate or missing asset id: ${asset.id}`);
    assetIds.add(asset.id);
  }
  const trackIds = new Set(), clipIds = new Set();
  for (const track of project.tracks ?? []) {
    if (!track.id || trackIds.has(track.id)) errors.push(`duplicate or missing track id: ${track.id}`);
    trackIds.add(track.id);
    for (const clip of track.clips ?? []) {
      if (!clip.id || clipIds.has(clip.id)) errors.push(`duplicate or missing clip id: ${clip.id}`);
      clipIds.add(clip.id);
      if (!Number.isFinite(clip.timelineStart) || clip.timelineStart < 0) errors.push(`invalid timelineStart: ${clip.id}`);
      if (!Number.isFinite(clip.sourceStart) || clip.sourceStart < 0) errors.push(`invalid sourceStart: ${clip.id}`);
      if (!Number.isFinite(clip.duration) || clip.duration <= 0) errors.push(`invalid duration: ${clip.id}`);
      if (!Number.isFinite(clip.playbackRate) || clip.playbackRate <= 0) errors.push(`invalid playbackRate: ${clip.id}`);
      if (!assetIds.has(clip.assetId)) errors.push(`missing asset ${clip.assetId} for clip ${clip.id}`);
    }
  }
  return errors;
}

export function assertValidProject(project) {
  const errors = validateProject(project);
  if (errors.length) throw new Error(`Invalid project: ${errors.join("; ")}`);
  return project;
}

export function cloneProject(project) {
  return structuredClone(project);
}
