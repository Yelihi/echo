import type { SupabaseClient } from "@supabase/supabase-js";

import type { SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type {
  MemorizationSession,
  SummaryMemorizationSessions,
} from "@/entities/memorization-session/models/entity";
import { SessionState } from "@/entities/memorization-session/models/enums";
import {
  mapMemorizationSessionRowToEntity,
  mapMemorizationSessionsMetadataRowToEntity,
  type MemorizationSessionParagraphRow,
  type MemorizationSessionSentenceRow,
  type MemorizationSessionTagRow,
} from "@/entities/memorization-session/models/mapper";
import type {
  FindMemorizationSessionsParams,
  MemorizationSessionRepositoryPort,
  CreateMemorizationSessionSnapshot,
} from "@/entities/memorization-session/models/repository";

export class MemorizationSessionRepository implements MemorizationSessionRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: SessionId): Promise<MemorizationSession | null> {
    const { data: session, error } = await this.supabase
      .from("memorization_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch memorization session: ${error.message}`);
    }

    if (!session) {
      return null;
    }

    const [tags, paragraphs, sentences] = await Promise.all([
      this.findTagsBySessionId(session.id as SessionId),
      this.findParagraphsBySessionId(session.id as SessionId),
      this.findSentencesBySessionId(session.id as SessionId),
    ]);

    return mapMemorizationSessionRowToEntity({ session, tags, paragraphs, sentences });
  }

  async getAllSessionsMetadata(): Promise<SummaryMemorizationSessions> {
    const { count, error } = await this.supabase
      .from("memorization_sessions")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(`Failed to fetch memorization sessions metadata: ${error.message}`);
    }

    return mapMemorizationSessionsMetadataRowToEntity(count ?? 0);
  }

  async findMany(params: FindMemorizationSessionsParams = {}): Promise<MemorizationSession[]> {
    const sessionIds = params.tagNormalizedName
      ? await this.findSessionIdsByTag(params.tagNormalizedName)
      : null;

    if (sessionIds && sessionIds.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("memorization_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (params.states) {
      query = query.in("status", [...params.states]);
    } else {
      query = query.eq("status", params.state ?? SessionState.IN_PROGRESS);
    }

    if (sessionIds) {
      query = query.in("id", sessionIds);
    }

    if (params.limit) {
      if (params.page != null) {
        const page = Math.max(1, params.page);
        const from = (page - 1) * params.limit;
        query = query.range(from, from + params.limit - 1);
      } else {
        query = query.limit(params.limit);
      }
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch memorization sessions: ${error.message}`);
    }

    if (!sessions.length) {
      return [];
    }

    const ids = sessions.map((session) => session.id as SessionId);
    const [tags, paragraphs, sentences] = await Promise.all([
      this.findTagsBySessionIds(ids),
      this.findParagraphsBySessionIds(ids),
      this.findSentencesBySessionIds(ids),
    ]);

    return sessions.map((session) =>
      mapMemorizationSessionRowToEntity({
        session,
        tags: tags.filter((tag) => tag.session_id === session.id),
        paragraphs: paragraphs.filter((paragraph) => paragraph.session_id === session.id),
        sentences: sentences.filter((sentence) => sentence.session_id === session.id),
      }),
    );
  }

  private async findSessionIdsByTag(normalizedName: string): Promise<SessionId[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_tags")
      .select("session_id")
      .eq("normalized_name", normalizedName);

    if (error) {
      throw new Error(`Failed to fetch memorization session tags: ${error.message}`);
    }

    return data.map((row) => row.session_id as SessionId);
  }

  private async findTagsBySessionId(sessionId: SessionId): Promise<MemorizationSessionTagRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_tags")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch memorization session tags: ${error.message}`);
    }

    return data;
  }

  private async findParagraphsBySessionId(
    sessionId: SessionId,
  ): Promise<MemorizationSessionParagraphRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_paragraphs")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch memorization session paragraphs: ${error.message}`);
    }

    return data;
  }

  private async findSentencesBySessionId(
    sessionId: SessionId,
  ): Promise<MemorizationSessionSentenceRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_sentences")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch memorization session sentences: ${error.message}`);
    }

    return data;
  }

  private async findTagsBySessionIds(
    sessionIds: ReadonlyArray<SessionId>,
  ): Promise<MemorizationSessionTagRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_tags")
      .select("*")
      .in("session_id", [...sessionIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization session tags: ${error.message}`);
    }

    return data;
  }

  private async findParagraphsBySessionIds(
    sessionIds: ReadonlyArray<SessionId>,
  ): Promise<MemorizationSessionParagraphRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_paragraphs")
      .select("*")
      .in("session_id", [...sessionIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization session paragraphs: ${error.message}`);
    }

    return data;
  }

  private async findSentencesBySessionIds(
    sessionIds: ReadonlyArray<SessionId>,
  ): Promise<MemorizationSessionSentenceRow[]> {
    const { data, error } = await this.supabase
      .from("memorization_session_sentences")
      .select("*")
      .in("session_id", [...sessionIds]);

    if (error) {
      throw new Error(`Failed to fetch memorization session sentences: ${error.message}`);
    }

    return data;
  }

  async createSession(snapshot: CreateMemorizationSessionSnapshot): Promise<MemorizationSession> {
    const { material } = snapshot;

    const { data: session, error: sessionError } = await this.supabase
      .from("memorization_sessions")
      .insert({
        user_id: material.ownerId,
        material_id: material.id,
        material_title_snapshot: material.title,
        current_paragraph_order: 0,
        current_sentence_order: 0,
        status: SessionState.READY,
        started_at: null,
      })
      .select("*")
      .single();

    if (sessionError || !session) {
      throw new Error(`Failed to create memorization session: ${sessionError?.message}`);
    }

    try {
      const tagsResult =
        material.tags.length === 0
          ? { data: [] as MemorizationSessionTagRow[], error: null }
          : await this.supabase
              .from("memorization_session_tags")
              .insert(
                material.tags.map((tag) => ({
                  session_id: session.id,
                  user_id: material.ownerId,
                  display_name: tag.displayName,
                  normalized_name: tag.normalizedName,
                })),
              )
              .select("*");

      if (tagsResult.error) {
        throw new Error(`Failed to create memorization session tags: ${tagsResult.error.message}`);
      }

      const { data: paragraphs, error: paragraphsError } = await this.supabase
        .from("memorization_session_paragraphs")
        .insert(
          material.paragraphs.map((paragraph) => ({
            session_id: session.id,
            user_id: material.ownerId,
            paragraph_order: paragraph.order,
          })),
        )
        .select("*");

      if (paragraphsError || !paragraphs) {
        throw new Error(
          `Failed to create memorization session paragraphs: ${paragraphsError?.message}`,
        );
      }

      const paragraphIdByOrder = new Map(
        paragraphs.map((paragraph) => [paragraph.paragraph_order, paragraph.id]),
      );

      const { data: sentences, error: sentencesError } = await this.supabase
        .from("memorization_session_sentences")
        .insert(
          material.paragraphs.flatMap((paragraph) => {
            const paragraphId = paragraphIdByOrder.get(paragraph.order);

            if (!paragraphId) {
              throw new Error(
                `Missing memorization session paragraph for order: ${paragraph.order}`,
              );
            }

            return paragraph.sentences.map((sentence) => ({
              session_id: session.id,
              user_id: material.ownerId,
              paragraph_id: paragraphId,
              sentence_order: sentence.order,
              text_snapshot: sentence.text,
              translation_snapshot: sentence.translation,
            }));
          }),
        )
        .select("*");

      if (sentencesError || !sentences) {
        throw new Error(
          `Failed to create memorization session sentences: ${sentencesError?.message}`,
        );
      }

      return mapMemorizationSessionRowToEntity({
        session,
        tags: tagsResult.data ?? [],
        paragraphs,
        sentences,
      });
    } catch (error) {
      await this.supabase.from("memorization_sessions").delete().eq("id", session.id);
      throw error;
    }
  }
}

export function createMemorizationSessionRepository(
  supabase: SupabaseClient<Database>,
): MemorizationSessionRepositoryPort {
  return new MemorizationSessionRepository(supabase);
}
