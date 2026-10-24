/** @jest-environment node */
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createValidatedCandidates } from "@/features/grammar-example-generation/services/createValidatedCandidates";

jest.mock("server-only", () => ({}));
jest.mock("@/shared/lib/openai/server", () => ({
  getOpenAIEvaluationModel: () => "test-model",
  getOpenAIServerClient: jest.fn(),
}));
const parse = jest.fn<(...args: unknown[]) => Promise<unknown>>();
beforeEach(async () => {
  jest.clearAllMocks();
  const { getOpenAIServerClient } = await import("@/shared/lib/openai/server");
  jest.mocked(getOpenAIServerClient).mockReturnValue({ responses: { parse } } as never);
});

describe("AI 직독직해 텍스트를 원문 범위로 변환", () => {
  it("예문 생성은 AI의 숫자 계산 없이 실제 구절로 검증 가능한 범위를 만든다", async () => {
    parse.mockResolvedValue({
      status: "completed",
      output_parsed: {
        examples: [
          {
            sentence: "I like tea, not coffee.",
            translation: "나는 커피가 아니라 차를 좋아해요.",
            targetExplanation: "not으로 대조합니다.",
            directReading: [
              { text: "I like tea,", korean: "나는 차를 좋아해요" },
              { text: "not coffee.", korean: "커피가 아니라" },
            ],
          },
        ],
      },
    });
    const { requestExampleOutput } =
      await import("@/features/grammar-example-generation/services/server/requestExampleOutput");
    const result = createValidatedCandidates(
      await requestExampleOutput(createEditorNote(), 1, 2),
      createEditorNote(),
      1,
    );
    expect(result[0].directReading).toEqual([
      { start: 0, end: 11, korean: "나는 차를 좋아해요" },
      { start: 11, end: 23, korean: "커피가 아니라" },
    ]);
    const request = parse.mock.calls[0][0] as { text: { format: { schema: unknown } } };
    expect(JSON.stringify(request.text.format.schema)).toContain('"text"');
    expect(JSON.stringify(request.text.format.schema)).not.toContain('"start"');
  });
  it.each([
    [
      "I see you. I see him.",
      [
        { text: "I see you.", korean: "나는 너를 봐" },
        { text: "I see him.", korean: "나는 그를 봐" },
      ],
      [0, 10, 21],
    ],
    [
      "I see 😀. I see you.",
      [
        { text: "I see 😀.", korean: "이모지를 봐" },
        { text: "I see you.", korean: "너를 봐" },
      ],
      [0, 9, 20],
    ],
  ])("수정 문장 %s의 공백·반복 구절·UTF-16 위치를 보존한다", async (sentence, blocks, offsets) => {
    parse.mockResolvedValue({ status: "completed", output_parsed: { directReading: blocks } });
    const { requestDirectReadingOutput } =
      await import("@/features/grammar-example-generation/services/server/requestDirectReadingOutput");
    const result = (await requestDirectReadingOutput(createEditorNote(), sentence)) as {
      directReading: { start: number; end: number }[];
    };
    expect(result.directReading.map((b) => b.start)).toEqual(offsets.slice(0, 2));
    expect(result.directReading.map((b) => b.end)).toEqual(offsets.slice(1));
  });
  it.each([
    [{ text: "I see", korean: "본다" }],
    [
      { text: "I", korean: "나는" },
      { text: "him.", korean: "그를" },
    ],
    [{ text: "I see her.", korean: "그녀를 본다" }],
    [{ text: " ", korean: "빈 구절" }],
  ])("누락·변조된 구절은 억지로 맞추지 않고 거절한다", async (...blocks) => {
    parse.mockResolvedValue({ status: "completed", output_parsed: { directReading: blocks } });
    const { requestDirectReadingOutput } =
      await import("@/features/grammar-example-generation/services/server/requestDirectReadingOutput");
    await expect(requestDirectReadingOutput(createEditorNote(), "I see him.")).rejects.toThrow();
  });
  it("출력이 잘린 응답을 정상 예문으로 처리하지 않는다", async () => {
    parse.mockResolvedValue({ status: "incomplete", output_parsed: null });
    const { requestExampleOutput } =
      await import("@/features/grammar-example-generation/services/server/requestExampleOutput");
    await expect(requestExampleOutput(createEditorNote(), 1, 2)).rejects.toThrow();
  });
});
