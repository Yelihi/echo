import { describe, expect, it } from "@jest/globals";
import { advanceScreenTrail, getScreenBackHref } from "@/widgets/app-shell/models/screenNavigation";

describe("screen return destinations", () => {
  it("returns through visited screens without bouncing back to the screen just left", () => {
    let trail = ["/home"];
    for (const path of ["/my-page", "/sessions", "/roleplay-sessions/123/result"])
      trail = advanceScreenTrail(trail, path);
    expect(getScreenBackHref(trail, "/roleplay-sessions/123/result")).toBe("/sessions");
    trail = advanceScreenTrail(trail, "/sessions");
    expect(getScreenBackHref(trail, "/sessions")).toBe("/my-page");
    expect(getScreenBackHref(trail, "/my-page")).toBe("/home");
  });
  it.each([
    ["/sessions", "/my-page"],
    ["/recording-management", "/my-page"],
    ["/my-page", "/home"],
    ["/role-playing", "/home"],
    ["/sentence-memorization", "/home"],
    ["/role-playing/abc/ready", "/role-playing"],
    ["/sentence-memorization/abc/ready", "/sentence-memorization"],
    ["/roleplay-sessions/abc/result", "/sessions"],
    ["/memorization-sessions/abc/result", "/sessions"],
  ])("direct access to %s has a safe parent", (path, parent) => {
    expect(getScreenBackHref([path], path)).toBe(parent);
  });
  it("does not reopen discarded editors and resets the trail at home", () => {
    const trail = advanceScreenTrail(["/my-page", "/role-playing/abc/edit"], "/role-playing");
    expect(getScreenBackHref(trail, "/role-playing")).toBe("/my-page");
    expect(advanceScreenTrail(trail, "/home")).toEqual(["/home"]);
  });
});
