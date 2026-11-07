export function createProjectHistory(initialProject, limit = 100) {
  if (!initialProject) throw new TypeError("initial project is required");
  const past = [], future = [];
  let present = structuredClone(initialProject);
  return Object.freeze({
    get current() { return structuredClone(present); },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    commit(nextProject) {
      if (!nextProject || typeof nextProject !== "object") throw new TypeError("next project is required");
      past.push(present); if (past.length > limit) past.shift();
      present = structuredClone(nextProject); future.length = 0;
      return structuredClone(present);
    },
    undo() {
      if (!past.length) return structuredClone(present);
      future.push(present); present = past.pop(); return structuredClone(present);
    },
    redo() {
      if (!future.length) return structuredClone(present);
      past.push(present); present = future.pop(); return structuredClone(present);
    }
  });
}
