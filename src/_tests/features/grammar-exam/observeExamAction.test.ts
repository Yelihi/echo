/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import { GrammarSessionError } from "@/entities/grammar-session";
import { GrammarExamError } from "@/features/grammar-exam/models/errors";

jest.mock("server-only", () => ({}));

jest.mock("@/shared/lib/logging/pino", () => ({ recordOperationEvent: jest.fn() }));

describe("시험 액션 오류 계약", () => {
  it.each([
    [new GrammarSessionError("CONFLICT"), "CONFLICT"],
    [new GrammarExamError("NOT_INVITED"), "NOT_INVITED"],
    [new Error("secret upstream response"), "FAILED"],
  ])("returns a safe code for %s", async (error, code) => {
    const { observeExamAction } =
      await import("@/features/grammar-exam/services/server/observeExamAction");
    const result = await observeExamAction("test.exam", async () => {
      throw error;
    });

    expect(result).toEqual({ ok: false, code });
  });
});
