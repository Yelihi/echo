import type { GrammarSource } from "@/entities/grammar-note";
import type {
  AnalysisRequestState,
  GrammarAnalysisController,
  GrammarAnalysisResult,
} from "../models/interface";
import { grammarAnalysisFailure } from "../models/errors";

/** Transport may keep running; cancellation always prevents stale result application. */
export function createAnalysisController(
  request: (source: GrammarSource) => Promise<GrammarAnalysisResult>,
): GrammarAnalysisController {
  let state: AnalysisRequestState = { status: "idle" };
  let generation = 0;
  const listeners = new Set<() => void>();
  const update = (next: AnalysisRequestState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    cancel: () => {
      generation++;
      update({ status: "idle" });
    },
    request: async (source) => {
      const current = ++generation;
      update({ status: "pending", sourceRevision: source.revision });
      let result: GrammarAnalysisResult;
      try {
        result = await request(source);
      } catch (error) {
        result = grammarAnalysisFailure(error);
      }
      if (generation === current)
        update({ status: "settled", result, sourceRevision: source.revision });
    },
  };
}
