/** @jest-environment node */
import { afterEach, expect, it, jest } from "@jest/globals";
import { evaluate } from "../../../../../supabase/functions/process-analysis-job/openai";

afterEach(() => {
  jest.restoreAllMocks();
  Reflect.deleteProperty(globalThis, "Deno");
});

it.each(["exact", "context"] as const)(
  "저장된 %s 평가 기준을 요청과 결과에 반영한다",
  async (evaluationMode) => {
    Object.defineProperty(globalThis, "Deno", {
      configurable: true,
      value: { env: { get: () => "test" } },
    });
    const input = {
      expectedText: "I would like tea.",
      transcript: "I want tea.",
      practiceType: "roleplay" as const,
      evaluationMode,
    };
    const fetchMock = jest.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify({ feedback: "Feedback", score: 90 }) } }],
        }),
        { status: 200 },
      ),
    );
    const result = await evaluate(input);
    const request = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(request.messages[1].content).toContain(`Evaluation mode: ${evaluationMode}`);
    if (evaluationMode === "context") {
      expect(request.messages[1].content).toContain("Accept equivalent paraphrases");
      expect(result.diff).toEqual([]);
    } else {
      expect(request.messages[1].content).toContain("Score fidelity");
      expect(result.diff.some((segment) => segment.op !== "equal")).toBe(true);
    }
  },
);
