import type { SupabaseClient } from "@supabase/supabase-js";

import type { SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type { MemorizationSession } from "@/entities/memorization-session/models/entity";
import { SessionState } from "@/entities/memorization-session/models/enums";
import {
  mapMemorizationSessionRowToEntity,
  type MemorizationSessionParagraphRow,
  type MemorizationSessionSentenceRow,
  type MemorizationSessionTagRow,
} from "@/entities/memorization-session/models/mapper";
import type {
  FindMemorizationSessionsParams,
  MemorizationSessionRepositoryPort,
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
      .eq("status", params.state ?? SessionState.IN_PROGRESS)
      .order("updated_at", { ascending: false });

    if (sessionIds) {
      query = query.in("id", sessionIds);
    }

    if (params.limit) {
      query = query.limit(params.limit);
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
}

export function createMemorizationSessionRepository(
  supabase: SupabaseClient<Database>,
): MemorizationSessionRepositoryPort {
  return new MemorizationSessionRepository(supabase);
}
