import {
  GrammarNotePersistenceError,
  grammarNoteContentSchema,
  type GrammarNoteRepositoryPort,
} from "@/entities/grammar-note";
import type { SaveNoteCommand } from "../models/interface";
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
    // 저장은 성공했지만 응답만 유실된 경우를 복구한다. 다른 수정까지 성공으로 오인하지 않도록
    // 바로 다음 버전이며 내용도 같은 경우에만 재시도를 성공으로 처리한다.
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
