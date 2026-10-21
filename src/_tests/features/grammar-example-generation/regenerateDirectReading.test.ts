import { describe, expect, it, jest } from "@jest/globals";
import type { GrammarNoteRepositoryPort } from "@/entities/grammar-note";
import type { ExampleDependencies } from "@/features/grammar-example-generation/models/interface";
import { regenerateDirectReading } from "@/features/grammar-example-generation/services/regenerateDirectReading";
import { createEditorNote } from "../grammar-note-editor/fixtures";

const sentence = "My edited sentence.";
const blocks = [{ start: 0, end: sentence.length, korean: "내가 수정한 문장입니다" }];

function setup() {
  const note = createEditorNote();
  const repository = {
    create: jest.fn<GrammarNoteRepositoryPort["create"]>(),
    update: jest.fn<GrammarNoteRepositoryPort["update"]>(),
    findById: jest.fn<GrammarNoteRepositoryPort["findById"]>().mockResolvedValue(note),
    findMany: jest.fn<GrammarNoteRepositoryPort["findMany"]>(),
  };
  const generateDirectReading = jest
    .fn<ExampleDependencies["generateDirectReading"]>()
    .mockResolvedValue({ directReading: blocks });
  const consumeRequest = jest
    .fn<ExampleDependencies["consumeRequest"]>()
    .mockResolvedValue("allowed");
  const dependencies: ExampleDependencies = {
    repository,
    generateDirectReading,
    consumeRequest,
    generate: jest.fn<ExampleDependencies["generate"]>(),
    loadDifficulty: jest.fn<ExampleDependencies["loadDifficulty"]>(),
  };
  return {
    note,
    repository,
    generateDirectReading,
    consumeRequest,
    dependencies,
    command: { noteId: note.id, expectedVersion: note.version, sentence },
  };
}

describe("수정된 예문의 직독직해 재생성", () => {
  it("소유 노트와 버전을 확인한 뒤 수정 문장의 블록만 생성한다", async () => {
    const context = setup();
    const result = await regenerateDirectReading(context.command, context.dependencies);

    expect(context.generateDirectReading).toHaveBeenCalledWith(context.note, sentence);
    expect(context.consumeRequest).toHaveBeenCalledTimes(1);
    expect(result).toEqual(blocks);
  });

  it("없는 노트·버전 충돌·요청 거부에는 AI를 호출하지 않는다", async () => {
    const context = setup();
    context.repository.findById.mockResolvedValueOnce(null);
    await expect(
      regenerateDirectReading(context.command, context.dependencies),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      regenerateDirectReading({ ...context.command, expectedVersion: 2 }, context.dependencies),
    ).rejects.toMatchObject({ code: "VERSION_CONFLICT" });
    context.consumeRequest.mockResolvedValueOnce("rate_limited");
    await expect(regenerateDirectReading(context.command, context.dependencies)).rejects.toThrow(
      "rate_limited",
    );
    expect(context.generateDirectReading).not.toHaveBeenCalled();
  });

  it("잘못된 span은 후보에 적용하지 않는다", async () => {
    const context = setup();
    context.generateDirectReading.mockResolvedValue({
      directReading: [{ start: 1, end: sentence.length, korean: "내가 수정한 문장입니다" }],
    });
    await expect(regenerateDirectReading(context.command, context.dependencies)).rejects.toThrow();
  });
});
