import {
  GrammarNotePersistenceError,
  grammarNoteContentSchema,
  type GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";
import type { SaveNoteCommand } from "../models/interface";
/** 생성의 중복 방지는 저장소의 요청 UUID, 수정의 재시도는 확정된 버전과 동일 내용으로 판정한다. */
export async function persistReviewedNote(
  command: SaveNoteCommand,
  repository: GrammarNoteRepositoryPort,
) {
  const parsed = grammarNoteContentSchema.safeParse(command.content);
  if (!parsed.success || parsed.data.analysis.reviewStatus !== "reviewed")
    throw new GrammarNotePersistenceError("INVALID_INPUT");
  if (!command.existing)
    return repository.create({ requestId: command.requestId, content: parsed.data });
  const { id, expectedVersion } = command.existing;
  try {
    return await repository.update({ id, expectedVersion, content: parsed.data });
  } catch (error) {
    if (!(error instanceof GrammarNotePersistenceError) || error.code !== "VERSION_CONFLICT")
      throw error;
    const current = await repository.findById(id);
    if (current?.version === expectedVersion + 1) {
      const currentContent = grammarNoteContentSchema.parse({
        source: current.source,
        metadata: current.metadata,
        analysis: current.analysis,
        examples: current.examples,
      });
      if (JSON.stringify(currentContent) === JSON.stringify(parsed.data)) return current;
    }
    throw error;
  }
}
