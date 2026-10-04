/** Screens that should never be reopened as a back destination after leaving them. */
export function isTransientScreen(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  return segments.at(-1) === "new" || segments.at(-1) === "edit" || segments.includes("session");
}

export function advanceScreenTrail(trail: readonly string[], pathname: string): string[] {
  if (pathname === "/home") return [pathname];
  const existing = trail.lastIndexOf(pathname);
  if (existing >= 0) return trail.slice(0, existing + 1);
  return [...trail.filter((path) => !isTransientScreen(path)), pathname];
}

export function getScreenFallback(pathname: string): string {
  const [root, ...segments] = pathname.split("/").filter(Boolean);
  if (root === "sessions" || root === "recording-management") return "/my-page";
  if (root === "roleplay-sessions" || root === "memorization-sessions") return "/sessions";
  if (root === "role-playing" && segments.length) return "/role-playing";
  if (root === "sentence-memorization" && segments.length) return "/sentence-memorization";
  return "/home";
}

export function getScreenBackHref(trail: readonly string[], pathname: string): string {
  const current = advanceScreenTrail(trail, pathname);
  return current.at(-2) ?? getScreenFallback(pathname);
}
