import type { GrammarNote, GrammarNoteContent } from "./entity";
import type { GrammarMetadata } from "./value-objects";

export interface CreateGrammarNoteInput {
  /** 한 번의 생성 의도에 발급한 UUID. 네트워크 재시도에는 같은 값을 사용한다. */
  readonly requestId: string;
  readonly content: GrammarNoteContent;
}
export interface UpdateGrammarNoteInput {
  readonly id: string;
  readonly expectedVersion: number;
  readonly content: GrammarNoteContent;
}
export interface FindGrammarNotesParams {
  readonly page?: number;
  readonly pageSize?: number;
  /** 제목과 기준 문장에 대한 대소문자 무시 부분 검색. SQL 와일드카드로 해석하지 않는다. */
  readonly query?: string;
}
export interface GrammarNoteSummary extends Pick<
  GrammarNote,
  "id" | "ownerId" | "version" | "createdAt" | "updatedAt"
> {
  readonly title: string;
  readonly sentence: string;
  readonly tags: GrammarMetadata["tags"];
}
export interface GrammarNotePage {
  readonly items: readonly GrammarNoteSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
export interface GrammarNoteRepositoryPort {
  create(input: CreateGrammarNoteInput): Promise<GrammarNote>;
  update(input: UpdateGrammarNoteInput): Promise<GrammarNote>;
  findById(id: string): Promise<GrammarNote | null>;
  findMany(params?: FindGrammarNotesParams): Promise<GrammarNotePage>;
}
