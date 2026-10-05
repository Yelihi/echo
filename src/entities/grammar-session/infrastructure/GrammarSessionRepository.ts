import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/shared/lib/supabase/database.types";
import { GrammarSessionError } from "../models/errors";
import { convertGrammarSessionRow } from "../models/converters/convertGrammarSessionRow";
import {
  startGrammarSessionSchema,
  saveGrammarAnswersSchema,
  completeGrammarSessionSchema,
  grammarSessionModeSchema,
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

const uuid = z.string().uuid();
const summarySchema = z.object({
  id: uuid,
  noteId: uuid,
  title: z.string(),
  mode: grammarSessionModeSchema,
  startedAt: z.string(),
  completedAt: z.string(),
  questionCount: z.number().int().positive(),
});
/** 모든 호출은 사용자 세션 client로 수행하고 소유권은 DB가 확인합니다. */
export class GrammarSessionRepository implements GrammarSessionRepositoryPort {
  constructor(private readonly db: SupabaseClient<Database>) {}
  private async request<T>(
    operation: () => PromiseLike<{ data: unknown; error: { message: string } | null }>,
    convert: (data: unknown) => T,
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
      return convert(result.data);
    } catch (error) {
      if (error instanceof GrammarSessionError) throw error;
      throw new GrammarSessionError("FAILED");
    }
  }
  async start(input: StartGrammarSessionInput) {
    const data = startGrammarSessionSchema.parse(input);
    return this.request(
      () =>
        this.db.rpc("start_grammar_session", {
          p_note_id: data.noteId,
          p_request_id: data.requestId,
          p_mode: data.mode,
        }),
      convertGrammarSessionRow,
    );
  }
  async findById(id: string) {
    uuid.parse(id);
    return this.request(
      () => this.db.from("grammar_sessions").select("*").eq("id", id).maybeSingle(),
      (data) => (data === null ? null : convertGrammarSessionRow(data)),
    );
  }
  async findActive(noteId: string, mode: GrammarSessionMode) {
    uuid.parse(noteId);
    grammarSessionModeSchema.parse(mode);
    return this.request(
      () =>
        this.db
          .from("grammar_sessions")
          .select("*")
          .eq("note_id", noteId)
          .eq("mode", mode)
          .eq("status", "active")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      (data) => (data === null ? null : convertGrammarSessionRow(data)),
    );
  }
  async saveAnswers(input: SaveGrammarAnswersInput) {
    const data = saveGrammarAnswersSchema.parse(input);
    return this.request(
      () =>
        this.db.rpc("save_grammar_session_answers", {
          p_session_id: data.id,
          p_expected_version: data.expectedVersion,
          p_answers: data.answers,
          p_phase: data.phase,
          p_question_index: data.questionIndex,
        }),
      convertGrammarSessionRow,
    );
  }
  async complete(input: CompleteGrammarSessionInput) {
    const data = completeGrammarSessionSchema.parse(input);
    return this.request(
      () =>
        this.db.rpc("complete_grammar_session", {
          p_session_id: data.id,
          p_expected_version: data.expectedVersion,
        }),
      convertGrammarSessionRow,
    );
  }
  async findHistory(input: GrammarSessionHistoryInput = {}) {
    const args = z
      .object({
        noteId: uuid.optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .parse(input);
    return this.request(
      () =>
        this.db.rpc("list_grammar_session_history", {
          p_note_id: args.noteId ?? undefined,
          p_page: args.page,
          p_page_size: args.pageSize,
        }),
      (data) => {
        const page = z
          .object({ items: z.array(summarySchema), total: z.number().int().nonnegative() })
          .parse(data);
        return { ...page, page: args.page, pageSize: args.pageSize };
      },
    );
  }
  /** 신규 문맥은 서버에서 생성·검증한 뒤 아직 답하지 않은 시험에 한 번만 고정합니다. */
  async setExamPrompts(id: string, questions: Json) {
    uuid.parse(id);
    return this.request(
      () => this.db.rpc("set_grammar_exam_prompts", { p_session_id: id, p_questions: questions }),
      convertGrammarSessionRow,
    );
  }
}
