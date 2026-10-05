import { describe, expect, it } from "@jest/globals";
import { createAnalysisController } from "../createAnalysisController";
import type { GrammarAnalysisResult } from "../../models/interface";

const source = { sentence: "She is a doctor.", learningNote: "보어", revision: 0 };
const result: GrammarAnalysisResult = {
  status: "needs-input",
  precheck: {
    status: "uncertain",
    sourceRevision: 0,
    issues: [{ field: "sentence", message: "보완 필요", suggestion: null }],
  },
};
function deferred() {
  let resolve!: (value: GrammarAnalysisResult) => void;
  const promise = new Promise<GrammarAnalysisResult>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe("analysis request lifecycle", () => {
  it("ignores a result arriving after cancellation", async () => {
    const task = deferred();
    const controller = createAnalysisController(() => task.promise);
    const pending = controller.request(source);
    controller.cancel();
    task.resolve(result);
    await pending;
    expect(controller.getState()).toEqual({ status: "idle" });
  });
  it("prevents the older request from replacing a newer result", async () => {
    const old = deferred();
    const current = deferred();
    const controller = createAnalysisController((input) =>
      input.revision === 0 ? old.promise : current.promise,
    );
    const first = controller.request(source);
    const second = controller.request({ ...source, revision: 1 });
    current.resolve(result);
    await second;
    old.resolve({ status: "error", code: "PROVIDER_FAILED", message: "늦은 실패" });
    await first;
    expect(controller.getState()).toEqual({ status: "settled", sourceRevision: 1, result });
  });
  it("handles transport rejection and permits retry", async () => {
    let calls = 0;
    const controller = createAnalysisController(async () => {
      if (++calls === 1) throw new Error("network");
      return result;
    });
    await controller.request(source);
    expect(controller.getState()).toMatchObject({ status: "settled", result: { status: "error" } });
    await controller.request(source);
    expect(controller.getState()).toMatchObject({ status: "settled", result });
  });
});
