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
    examples: createExampleCandidates().map(
      ({ sentence, translation, targetExplanation, directReading }) => ({
        sentence,
        translation,
        targetExplanation,
        directReading,
      }),
    ),
  });
  const generateDirectReading = jest.fn<ExampleDependencies["generateDirectReading"]>();
  const consumeRequest = jest
    .fn<ExampleDependencies["consumeRequest"]>()
    .mockResolvedValue("allowed");
  const loadDifficulty = jest.fn<() => Promise<1 | 2 | 3>>().mockResolvedValue(2);

  return {
    note,
    repository,
    generate,
    generateDirectReading,
    consumeRequest,
    loadDifficulty,
    command: { noteId: note.id, expectedVersion: 1, count: 3 as const },
  };
}

describe("저장 노트 기반 예문 생성 및 채택", () => {
  it.each([1, 2, 3] as const)(
    "난이도 %i와 정렬된 직독직해 블록을 후보로 전달한다",
    async (difficulty) => {
      const deps = setup();
      const sentence = "He is not a driver but a teacher.";
      deps.loadDifficulty.mockResolvedValue(difficulty);
      deps.generate.mockResolvedValue({
        examples: [
          {
            sentence,
            translation: "그는 운전사가 아니라 교사입니다.",
            targetExplanation: "not A but B는 대조를 나타냅니다.",
            directReading: [
              { start: 0, end: 6, korean: "그는" },
              { start: 6, end: sentence.length, korean: "운전사가 아니라 교사입니다" },
            ],
          },
        ],
      });

      const result = await generateExamples({ ...deps.command, count: 1 }, deps);

      expect(deps.generate).toHaveBeenCalledWith(deps.note, 1, difficulty);
      expect(result[0].targetExplanation).toContain("대조");
      expect(result[0].directReading).toEqual([
        { start: 0, end: 6, korean: "그는" },
        { start: 6, end: sentence.length, korean: "운전사가 아니라 교사입니다" },
      ]);
    },
  );

  it.each([
    [{ start: 1, end: 5, korean: "그는" }],
    [{ start: 0, end: 5, korean: "English only" }],
    [{ start: 0, end: 50, korean: "그는" }],
  ])("잘못된 span 또는 한국어 블록은 후보로 전달하지 않는다", async (directReading) => {
    const deps = setup();
    deps.generate.mockResolvedValue({
      examples: [
        {
          sentence: "He is not a driver but a teacher.",
          translation: "그는 운전사가 아니라 교사입니다.",
          targetExplanation: "대조를 나타냅니다.",
          directReading,
        },
      ],
    });

    await expect(generateExamples({ ...deps.command, count: 1 }, deps)).rejects.toThrow();
  });
  it("서버가 읽은 어법을 전달하고 검증된 후보를 미검토 상태로 반환한다", async () => {
    const deps = setup();
    const result = await generateExamples(deps.command, deps);

    expect(deps.generate).toHaveBeenCalledWith(deps.note, 3, 2);
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

  it("저장된 난이도를 다음 예문 생성에 적용한다", async () => {
    const deps = setup();
    deps.loadDifficulty.mockResolvedValue(3);

    await generateExamples(deps.command, deps);

    expect(deps.generate).toHaveBeenCalledWith(deps.note, 3, 3);
  });

  it("난이도 조회 실패 시 요청 한도와 AI 비용을 소비하지 않는다", async () => {
    const deps = setup();
    deps.loadDifficulty.mockRejectedValue(new Error("profile unavailable"));

    await expect(generateExamples(deps.command, deps)).rejects.toThrow("profile unavailable");
    expect(deps.consumeRequest).not.toHaveBeenCalled();
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

  it("직독직해가 없는 새 후보는 서버 저장을 거절한다", async () => {
    const deps = setup();
    const candidate = { ...createExampleCandidates()[0], directReading: undefined };

    await expect(
      saveExamples(
        {
          noteId: deps.note.id,
          expectedVersion: deps.note.version,
          candidates: [candidate],
        },
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

describe("생성·채택 정책 회귀", () => {
  it("요청 개수와 다른 생성 응답을 후보로 전달하지 않는다", async () => {
    const deps = setup();
    deps.generate.mockResolvedValue({
      examples: createExampleCandidates()
        .slice(0, 2)
        .map(({ sentence, translation, targetExplanation, directReading }) => ({
          sentence,
          translation,
          targetExplanation,
          directReading,
        })),
    });
    await expect(generateExamples(deps.command, deps)).rejects.toThrow("INVALID_EXAMPLE_COUNT");
  });

  it("공백·대소문자만 다른 생성 문장을 중복으로 검사한다", async () => {
    const deps = setup();
    const examples = createExampleCandidates().map(
      ({ sentence, translation, targetExplanation, directReading }) => ({
        sentence,
        translation,
        targetExplanation,
        directReading,
      }),
    );
    examples[1].sentence = ` ${examples[0].sentence.toUpperCase()} `;
    deps.generate.mockResolvedValue({ examples });
    await expect(generateExamples(deps.command, deps)).rejects.toThrow("DUPLICATE_EXAMPLES");
  });

  it.each(["source", "saved"])("%s 문장을 재사용한 생성 결과는 반환하지 않는다", async (kind) => {
    const deps = setup();
    const examples = createExampleCandidates().map(
      ({ sentence, translation, targetExplanation, directReading }) => ({
        sentence,
        translation,
        targetExplanation,
        directReading,
      }),
    );
    if (kind === "source") examples[0].sentence = ` ${deps.note.source.sentence.toUpperCase()} `;
    else
      deps.repository.findById.mockResolvedValue({
        ...deps.note,
        examples: [createExampleCandidates()[0]],
      });
    deps.generate.mockResolvedValue({ examples });
    await expect(generateExamples(deps.command, deps)).rejects.toThrow("REPEATED_EXAMPLES");
  });

  it.each(["sentence", "translation", "targetExplanation"] as const)(
    "저장된 후보의 %s가 달라지면 동일 재시도로 인정하지 않는다",
    async (field) => {
      const deps = setup();
      const candidate = createExampleCandidates()[0];
      deps.repository.findById.mockResolvedValue({
        ...deps.note,
        version: 2,
        examples: [{ ...candidate, reviewStatus: "reviewed" }],
      });
      const changed =
        field === "sentence"
          ? {
              ...candidate,
              sentence: "Changed sentence.",
              directReading: [{ start: 0, end: 17, korean: "바뀐 문장입니다" }],
            }
          : { ...candidate, [field]: "변경된 내용입니다." };
      await expect(
        saveExamples(
          {
            noteId: deps.note.id,
            expectedVersion: 1,
            candidates: [changed],
          },
          deps.repository,
        ),
      ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
      expect(deps.repository.update).not.toHaveBeenCalled();
    },
  );

  it("같은 후보 ID라도 직독직해 내용이 달라지면 중복 저장 성공으로 오인하지 않는다", async () => {
    const deps = setup();
    const candidate = createExampleCandidates()[0];
    deps.repository.findById.mockResolvedValue({
      ...deps.note,
      version: 2,
      examples: [{ ...candidate, reviewStatus: "reviewed" }],
    });

    await expect(
      saveExamples(
        {
          noteId: deps.note.id,
          expectedVersion: 1,
          candidates: [
            {
              ...candidate,
              directReading: [
                {
                  start: 0,
                  end: candidate.sentence.length,
                  korean: "다른 직독직해입니다",
                },
              ],
            },
          ],
        },
        deps.repository,
      ),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    expect(deps.repository.update).not.toHaveBeenCalled();
  });

  it("일부 ID만 이미 저장되었다면 새 후보를 중복 채택하지 않는다", async () => {
    const deps = setup();
    const candidates = createExampleCandidates();
    deps.repository.findById.mockResolvedValue({
      ...deps.note,
      examples: [{ ...candidates[0], reviewStatus: "reviewed" }],
    });
    await expect(
      saveExamples({ noteId: deps.note.id, expectedVersion: 1, candidates }, deps.repository),
    ).rejects.toThrow("DUPLICATE_CANDIDATE");
    expect(deps.repository.update).not.toHaveBeenCalled();
  });
});
