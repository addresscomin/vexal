import { assertValidProject, cloneProject, PROJECT_SCHEMA_VERSION } from "./project-model.mjs";

export function serializeProject(project) {
  assertValidProject(project);
  return JSON.stringify(project, null, 2);
}

export function parseProjectDocument(text) {
  if (typeof text !== "string") throw new TypeError("project document must be text");
  const parsed = JSON.parse(text);
  if (parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) throw new Error(`Unsupported project schema version: ${parsed.schemaVersion}`);
  assertValidProject(parsed);
  return cloneProject(parsed);
}

export function createProjectSnapshot(project) {
  const safe = cloneProject(assertValidProject(project));
  return { format: "skycut-project", schemaVersion: PROJECT_SCHEMA_VERSION, project: safe };
}

export function parseProjectSnapshot(text) {
  const parsed = JSON.parse(text);
  if (parsed.format !== "skycut-project" || parsed.schemaVersion !== PROJECT_SCHEMA_VERSION) throw new Error("Unsupported SkyCut snapshot");
  assertValidProject(parsed.project);
  return cloneProject(parsed.project);
}
