import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import { GrammarSessionError } from "../models/errors";
import { mapGrammarSessionRowToEntity } from "../models/mapper";
import {
  startGrammarSessionSchema,
  saveGrammarAnswersSchema,
  completeGrammarSessionSchema,
  grammarSessionModeSchema,
  grammarSessionIdSchema,
  findGrammarSessionHistorySchema,
  grammarSessionHistoryPageSchema,
} from "../models/schema";
import type {
  StartGrammarSessionInput,
  SaveGrammarAnswersInput,
  CompleteGrammarSessionInput,
  GrammarSessionMode,
} from "../models/schema";
import type {
  GrammarSessionRepositoryPort,
  GrammarSessionHistoryInput,
} from "../models/repository";

/** 모든 호출은 사용자 세션 client로 수행하고 소유권은 DB가 확인합니다. */
export class GrammarSessionRepository implements GrammarSessionRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}
  private async request<T>(
    operation: () => PromiseLike<{ data: unknown; error: { message: string } | null }>,
    mapResponse: (data: unknown) => T,
  ): Promise<T> {
    try {
      const result = await operation();
      if (result.error) {
        const codes = [
          "UNAUTHORIZED",
          "NOT_FOUND",
          "CONFLICT",
          "INCOMPLETE",
          "INVALID_INPUT",
        ] as const;
        throw new GrammarSessionError(
          codes.find((code) => result.error?.message.includes(`GRAMMAR_SESSION_${code}`)) ??
            "FAILED",
        );
      }
      return mapResponse(result.data);
    } catch (error) {
      if (error instanceof GrammarSessionError) throw error;
      throw new GrammarSessionError("FAILED");
    }
  }
  async start(input: StartGrammarSessionInput) {
    const data = startGrammarSessionSchema.parse(input);
    return this.request(
      () =>
        this.supabase.rpc("start_grammar_session", {
          p_note_id: data.noteId,
          p_request_id: data.requestId,
          p_mode: data.mode,
        }),
      mapGrammarSessionRowToEntity,
    );
  }
  async findById(id: string) {
    grammarSessionIdSchema.parse(id);
    return this.request(
      () => this.supabase.from("grammar_sessions").select("*").eq("id", id).maybeSingle(),
      (data) => (data === null ? null : mapGrammarSessionRowToEntity(data)),
    );
  }
  async findActive(noteId: string, mode: GrammarSessionMode) {
    grammarSessionIdSchema.parse(noteId);
    grammarSessionModeSchema.parse(mode);
    return this.request(
      () =>
        this.supabase
          .from("grammar_sessions")
          .select("*")
          .eq("note_id", noteId)
          .eq("mode", mode)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      (data) => (data === null ? null : mapGrammarSessionRowToEntity(data)),
    );
  }
  async saveAnswers(input: SaveGrammarAnswersInput) {
    const data = saveGrammarAnswersSchema.parse(input);
    return this.request(
      () =>
        this.supabase.rpc("save_grammar_session_answers", {
          p_session_id: data.id,
          p_expected_version: data.expectedVersion,
          p_answers: data.answers,
          p_phase: data.phase,
          p_question_index: data.questionIndex,
        }),
      mapGrammarSessionRowToEntity,
    );
  }
  async complete(input: CompleteGrammarSessionInput) {
    const data = completeGrammarSessionSchema.parse(input);
    return this.request(
      () =>
        this.supabase.rpc("complete_grammar_session", {
          p_session_id: data.id,
          p_expected_version: data.expectedVersion,
        }),
      mapGrammarSessionRowToEntity,
    );
  }
  async findHistory(input: GrammarSessionHistoryInput = {}) {
    const params = findGrammarSessionHistorySchema.parse(input);
    return this.request(
      () =>
        this.supabase.rpc("list_grammar_session_history", {
          p_note_id: params.noteId ?? undefined,
          p_page: params.page,
          p_page_size: params.pageSize,
        }),
      (data) => {
        const page = grammarSessionHistoryPageSchema.parse(data);
        return { ...page, page: params.page, pageSize: params.pageSize };
      },
    );
  }
  async setExamPrompts(id: string, questions: Json) {
    grammarSessionIdSchema.parse(id);
    return this.request(
      () =>
        this.supabase.rpc("set_grammar_exam_prompts", { p_session_id: id, p_questions: questions }),
      mapGrammarSessionRowToEntity,
    );
  }
}
