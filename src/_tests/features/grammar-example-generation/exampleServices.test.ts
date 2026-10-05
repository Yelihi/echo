import { randomUUID } from "node:crypto";
import { describe, expect, it, jest } from "@jest/globals";
import type { GrammarNoteRepositoryPort } from "@/entities/grammar-note";
import type { ExampleDependencies } from "@/features/grammar-example-generation/models/interface";
import { generateExamples } from "@/features/grammar-example-generation/services/generateExamples";
import { saveExamples } from "@/features/grammar-example-generation/services/saveExamples";
import { createEditorNote } from "../grammar-note-editor/fixtures";
import { createExampleCandidates } from "./fixtures";
Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID, configurable: true });
function setup() {
  const note = createEditorNote();
  const repository = {
    create: jest.fn<GrammarNoteRepositoryPort["create"]>(),
    update: jest
      .fn<GrammarNoteRepositoryPort["update"]>()
      .mockResolvedValue({ ...note, version: 2 }),
    findById: jest.fn<GrammarNoteRepositoryPort["findById"]>().mockResolvedValue(note),
    findMany: jest.fn<GrammarNoteRepositoryPort["findMany"]>(),
  };
  const generate = jest.fn<ExampleDependencies["generate"]>().mockResolvedValue({
    examples: createExampleCandidates().map(({ sentence, translation, targetExplanation }) => ({
      sentence,
      translation,
      targetExplanation,
    })),
  });
  const consumeRequest = jest
    .fn<ExampleDependencies["consumeRequest"]>()
    .mockResolvedValue("allowed");
  return {
    note,
    repository,
    generate,
    consumeRequest,
    command: { noteId: note.id, expectedVersion: 1, count: 3 as const },
  };
}
describe("저장 노트 기반 예문 생성 및 채택", () => {
  it("서버가 읽은 어법을 전달하고 검증된 후보를 미검토 상태로 반환한다", async () => {
    const deps = setup();
    const result = await generateExamples(deps.command, deps);
    expect(deps.generate).toHaveBeenCalledWith(deps.note, 3);
    expect(result).toHaveLength(3);
    expect(result.every((example) => example.reviewStatus === "needs-review")).toBe(true);
    expect(new Set(result.map((example) => example.id)).size).toBe(3);
  });
  it("클라이언트가 목표 어법을 끼워 넣으면 외부 호출 전에 거절한다", async () => {
    const deps = setup();
    await expect(generateExamples({ ...deps.command, target: "override" }, deps)).rejects.toThrow();
    expect(deps.generate).not.toHaveBeenCalled();
  });
  it("소유하지 않은 노트를 읽을 수 없으면 비용을 소비하지 않는다", async () => {
    const deps = setup();
    deps.repository.findById.mockResolvedValue(null);
    await expect(generateExamples(deps.command, deps)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(deps.consumeRequest).not.toHaveBeenCalled();
  });
  it("버전이 달라지면 이전 어법으로 생성하지 않는다", async () => {
    const deps = setup();
    await expect(
      generateExamples({ ...deps.command, expectedVersion: 2 }, deps),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(deps.generate).not.toHaveBeenCalled();
  });
  it("한도를 초과하면 외부 요청을 보내지 않는다", async () => {
    const deps = setup();
    deps.consumeRequest.mockResolvedValue("rate_limited");
    await expect(generateExamples(deps.command, deps)).rejects.toThrow("rate_limited");
    expect(deps.generate).not.toHaveBeenCalled();
  });
  it("예문 개수가 다르거나 공백인 결과를 반환하지 않는다", async () => {
    const deps = setup();
    deps.generate.mockResolvedValue({
      examples: [{ sentence: " ", translation: "뜻", targetExplanation: "설명" }],
    });
    await expect(generateExamples({ ...deps.command, count: 1 }, deps)).rejects.toThrow();
  });
  it("선택한 예문만 검토 완료로 저장하고 기존 노트와 예문을 보존한다", async () => {
    const deps = setup();
    const candidates = createExampleCandidates();
    deps.repository.findById.mockResolvedValue({ ...deps.note, examples: [candidates[0]] });
    await saveExamples(
      { noteId: deps.note.id, expectedVersion: 1, candidates: [candidates[1]] },
      deps.repository,
    );
    expect(deps.repository.update).toHaveBeenCalledWith({
      id: deps.note.id,
      expectedVersion: 1,
      content: {
        source: deps.note.source,
        metadata: deps.note.metadata,
        analysis: deps.note.analysis,
        examples: [candidates[0], { ...candidates[1], reviewStatus: "reviewed" }],
      },
    });
  });
  it("저장 충돌은 다른 노트 변경을 덮어쓰지 않는다", async () => {
    const deps = setup();
    await expect(
      saveExamples(
        { noteId: deps.note.id, expectedVersion: 2, candidates: createExampleCandidates() },
        deps.repository,
      ),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(deps.repository.update).not.toHaveBeenCalled();
  });
  it("중복 후보 식별자는 저장하지 않는다", async () => {
    const deps = setup();
    const candidate = createExampleCandidates()[0];
    await expect(
      saveExamples(
        { noteId: deps.note.id, expectedVersion: 1, candidates: [candidate, candidate] },
        deps.repository,
      ),
    ).rejects.toThrow();
    expect(deps.repository.update).not.toHaveBeenCalled();
  });
  it("saved candidate retry does not increment the version", async () => {
    const deps = setup();
    const candidates = createExampleCandidates().map((candidate) => ({
      ...candidate,
      reviewStatus: "reviewed" as const,
    }));
    const stored = { ...deps.note, version: 2, examples: candidates };
    deps.repository.findById.mockResolvedValue(stored);
    const result = await saveExamples(
      { noteId: deps.note.id, expectedVersion: 1, candidates: createExampleCandidates() },
      deps.repository,
    );
    expect(result).toBe(stored);
    expect(deps.repository.update).not.toHaveBeenCalled();
  });
});
