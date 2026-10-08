import type { GrammarNote } from "@/entities/grammar-note";
import type { GrammarNoteAudioInput } from "../models/interface";

/** 클라이언트 문장이 아닌, 소유권 검증을 마친 저장 노트에서만 음성 대상을 선택한다. */
export function resolveGrammarAudioText(
  note: GrammarNote | null,
  input: GrammarNoteAudioInput,
): string {
  if (!note || note.id !== input.noteId || note.version !== input.noteVersion)
    throw new Error("노트가 변경되었습니다. 새로고침 후 다시 시도해주세요.");

  if (input.sentenceId === "source") return note.source.sentence;

  const example = note.examples.find(
    (item) => item.id === input.sentenceId && item.reviewStatus === "reviewed",
  );

  if (!example) throw new Error("저장하고 채택한 문장만 재생할 수 있습니다.");

  return example.sentence;
}
