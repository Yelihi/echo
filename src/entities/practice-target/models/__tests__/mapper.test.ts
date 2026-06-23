import { describe, expect, it } from "@jest/globals";

import { PracticeType } from "@/entities/practice-target";
import {
  mapPracticeTargetFields,
  mapSessionPracticeTargetFields,
} from "@/entities/practice-target/models/mapper";

describe("practice target mappers", () => {
  it("maps roleplay target fields", () => {
    const target = mapPracticeTargetFields(
      {
        id: "result-1",
        roleplay_session_id: "11111111-1111-4111-8111-111111111111",
        roleplay_line_id: "22222222-2222-4222-8222-222222222222",
        memorization_session_id: null,
        memorization_sentence_id: null,
      },
      "test",
    );

    expect(target).toEqual({
      practiceType: PracticeType.ROLEPLAY,
      sessionId: "11111111-1111-4111-8111-111111111111",
      lineSnapshotId: "22222222-2222-4222-8222-222222222222",
    });
  });

  it("maps memorization target fields", () => {
    const target = mapPracticeTargetFields(
      {
        id: "result-1",
        roleplay_session_id: null,
        roleplay_line_id: null,
        memorization_session_id: "33333333-3333-4333-8333-333333333333",
        memorization_sentence_id: "44444444-4444-4444-8444-444444444444",
      },
      "test",
    );

    expect(target).toEqual({
      practiceType: PracticeType.MEMORIZATION,
      sessionId: "33333333-3333-4333-8333-333333333333",
      sentenceSnapshotId: "44444444-4444-4444-8444-444444444444",
    });
  });

  it("rejects mixed target fields", () => {
    expect(() =>
      mapPracticeTargetFields(
        {
          id: "result-1",
          roleplay_session_id: "11111111-1111-4111-8111-111111111111",
          roleplay_line_id: "22222222-2222-4222-8222-222222222222",
          memorization_session_id: "33333333-3333-4333-8333-333333333333",
          memorization_sentence_id: null,
        },
        "test",
      ),
    ).toThrow("Invalid test target: result-1");
  });

  it("maps session target fields", () => {
    const target = mapSessionPracticeTargetFields(
      {
        id: "job-1",
        roleplay_session_id: null,
        memorization_session_id: "33333333-3333-4333-8333-333333333333",
      },
      "test",
    );

    expect(target).toEqual({
      practiceType: PracticeType.MEMORIZATION,
      sessionId: "33333333-3333-4333-8333-333333333333",
    });
  });
});
