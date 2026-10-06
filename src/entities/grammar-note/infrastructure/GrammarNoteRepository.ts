import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import type {
  GrammarNoteRepositoryPort,
  CreateGrammarNoteInput,
  UpdateGrammarNoteInput,
  FindGrammarNotesParams,
} from "../models/repository";
import { GrammarNotePersistenceError } from "../models/errors";
import {
  createGrammarNoteSchema,
  updateGrammarNoteSchema,
  findGrammarNotesSchema,
  grammarNoteIdSchema,
} from "../models/schema";
import {
  mapGrammarNoteContentToJson,
  mapGrammarNoteRowToEntity,
  mapGrammarNotePageToEntity,
} from "../models/mapper";
import { executeGrammarNoteRequest } from "./executeGrammarNoteRequest";

/** 로그인 사용자의 Supabase client를 받는다. 소유권은 DB의 auth.uid()/RLS가 결정한다. */
export class GrammarNoteRepository implements GrammarNoteRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(input: CreateGrammarNoteInput) {
    const parsed = createGrammarNoteSchema.safeParse(input);
    if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_INPUT");
    return executeGrammarNoteRequest(
      () =>
        this.supabase.rpc("create_grammar_note", {
          p_request_id: parsed.data.requestId,
          p_content: mapGrammarNoteContentToJson(parsed.data.content),
        }),
      mapGrammarNoteRowToEntity,
    );
  }

  async update(input: UpdateGrammarNoteInput) {
    const parsed = updateGrammarNoteSchema.safeParse(input);
    if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_INPUT");
    return executeGrammarNoteRequest(
      () =>
        this.supabase.rpc("update_grammar_note", {
          p_note_id: parsed.data.id,
          p_expected_version: parsed.data.expectedVersion,
          p_content: mapGrammarNoteContentToJson(parsed.data.content),
        }),
      mapGrammarNoteRowToEntity,
    );
  }

  async findById(id: string) {
    const parsed = grammarNoteIdSchema.safeParse(id);
    if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_INPUT");
    return executeGrammarNoteRequest(
      () =>
        this.supabase
          .from("grammar_notes")
          .select("id,owner_id,content,version,created_at,updated_at")
          .eq("id", parsed.data)
          .maybeSingle(),
      // RLS로 숨겨진 타 사용자 노트도 존재하지 않는 노트와 동일하게 처리한다.
      (data) => (data === null ? null : mapGrammarNoteRowToEntity(data)),
    );
  }

  async findMany(params: FindGrammarNotesParams = {}) {
    const parsed = findGrammarNotesSchema.safeParse(params);
    if (!parsed.success) throw new GrammarNotePersistenceError("INVALID_INPUT");
    const { page, pageSize, query } = parsed.data;
    return executeGrammarNoteRequest(
      () =>
        this.supabase.rpc("list_grammar_notes", {
          p_page: page,
          p_page_size: pageSize,
          p_query: query,
        }),
      (data) => mapGrammarNotePageToEntity(data, { page, pageSize }),
    );
  }
}
