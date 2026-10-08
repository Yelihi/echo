"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createAnalysisController } from "../createAnalysisController";
import { requestGrammarAnalysis } from "../actions/requestGrammarAnalysis";

export function useGrammarAnalysis() {
  const [controller] = useState(() => createAnalysisController(requestGrammarAnalysis));
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getState,
    controller.getState,
  );
  useEffect(() => () => controller.cancel(), [controller]);
  return { state, request: controller.request, cancel: controller.cancel };
}
