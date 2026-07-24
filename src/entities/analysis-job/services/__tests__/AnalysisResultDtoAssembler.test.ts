import { describe, expect, it } from "@jest/globals";

import { AnalysisJobState } from "@/entities/analysis-job/models/enums";
import {
  createAnalysisResultDto,
  mapAnalysisResultState,
} from "@/entities/analysis-job/services/AnalysisResultDtoAssembler";
import { PracticeType, type PracticeTarget } from "@/entities/practice-target";
import type { LineId, SessionId } from "@/entities/value-object";

describe("mapAnalysisResultState", () => {
  it("maps lifecycle states to result states", () => {
    expect(mapAnalysisResultState(AnalysisJobState.QUEUED, 2, 0)).toBe("pending");
    expect(mapAnalysisResultState(AnalysisJobState.PROCESSING, 2, 0)).toBe("analyzing");
    expect(mapAnalysisResultState(AnalysisJobState.COMPLETED, 2, 2)).toBe("done");
    expect(mapAnalysisResultState(AnalysisJobState.COMPLETED, 2, 1)).toBe("partial");
    expect(mapAnalysisResultState(AnalysisJobState.FAILED, 2, 1)).toBe("partial");
    expect(mapAnalysisResultState(AnalysisJobState.FAILED, 2, 0)).toBe("failed");
    expect(mapAnalysisResultState(AnalysisJobState.CANCELED, 2, 0)).toBe("failed");
  });
});

describe("createAnalysisResultDto", () => {
  it("combines expected text snapshots and normalized evaluation results", () => {
    const dto = createAnalysisResultDto({
      job: { state: AnalysisJobState.COMPLETED },
      expectedTargets: [
        {
          id: "line-1",
          original: "I would like a window seat.",
          target: createRoleplayTarget("line-1"),
          audio: { signedUrl: "https://example.test/audio.wav", durationSec: 3 },
        },
      ],
      results: [
        {
          schemaVersion: "v1",
          target: createRoleplayTarget("line-1"),
          transcript: "I want a window seat.",
          diff: [{ op: "replace", expected: "would like", actual: "want" }],
          feedback: "Use the more polite phrase.",
        },
      ],
    });

    expect(dto).toEqual({
      state: "done",
      items: [
        {
          id: "line-1",
          original: "I would like a window seat.",
          target: createRoleplayTarget("line-1"),
          audio: { signedUrl: "https://example.test/audio.wav", durationSec: 3 },
          state: "ready",
          schemaVersion: "v1",
          transcript: "I want a window seat.",
          diff: [{ op: "replace", expected: "would like", actual: "want" }],
          feedback: "Use the more polite phrase.",
        },
      ],
    });
  });

  it("marks targets without results as missing", () => {
    const dto = createAnalysisResultDto({
      job: { state: AnalysisJobState.FAILED },
      expectedTargets: [
        {
          id: "line-1",
          original: "First line.",
          target: createRoleplayTarget("line-1"),
        },
        {
          id: "line-2",
          original: "Second line.",
          target: createRoleplayTarget("line-2"),
        },
      ],
      results: [
        {
          schemaVersion: "v1",
          target: createRoleplayTarget("line-1"),
          transcript: "First line.",
          diff: [{ op: "equal", expected: "First line.", actual: "First line." }],
          feedback: "Good.",
        },
      ],
    });

    expect(dto.state).toBe("partial");
    expect(dto.items[1]).toEqual({
      id: "line-2",
      original: "Second line.",
      target: createRoleplayTarget("line-2"),
      state: "missing",
    });
  });

  it("marks targets without results as pending while the job is not terminal", () => {
    const dto = createAnalysisResultDto({
      job: { state: AnalysisJobState.PROCESSING },
      expectedTargets: [
        {
          id: "line-1",
          original: "First line.",
          target: createRoleplayTarget("line-1"),
        },
      ],
      results: [],
    });

    expect(dto).toEqual({
      state: "analyzing",
      items: [
        {
          id: "line-1",
          original: "First line.",
          target: createRoleplayTarget("line-1"),
          state: "pending",
        },
      ],
    });
  });
});

function createRoleplayTarget(lineId: string): PracticeTarget {
  return {
    practiceType: PracticeType.ROLEPLAY,
    sessionId: "session-1" as SessionId,
    lineSnapshotId: lineId as LineId,
  };
}
