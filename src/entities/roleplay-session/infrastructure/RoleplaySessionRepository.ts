import type { SupabaseClient } from "@supabase/supabase-js";

import type { SessionId, SpeakerId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type {
  RoleplaySession,
  SummaryRoleplaySessions,
} from "@/entities/roleplay-session/models/entity";
import { SessionState } from "@/entities/roleplay-session/models/enums";
import {
  mapRoleplaySessionRowToEntity,
  mapRoleplaySessionsMetadataRowToEntity,
  type RoleplaySessionLineRow,
  type RoleplaySessionTagRow,
} from "@/entities/roleplay-session/models/mapper";
import type {
  CreateRoleplaySessionSnapshot,
  FindRoleplaySessionsParams,
  RoleplaySessionRepositoryPort,
} from "@/entities/roleplay-session/models/repository";

export class RoleplaySessionRepository implements RoleplaySessionRepositoryPort {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async findById(id: SessionId): Promise<RoleplaySession | null> {
    const { data: session, error } = await this.supabase
      .from("roleplay_sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch roleplay session: ${error.message}`);
    }

    if (!session) {
      return null;
    }

    const [tags, lines] = await Promise.all([
      this.findTagsBySessionId(session.id as SessionId),
      this.findLinesBySessionId(session.id as SessionId),
    ]);

    return mapRoleplaySessionRowToEntity({ session, tags, lines });
  }

  async getAllSessionsMetadata(): Promise<SummaryRoleplaySessions> {
    const { count, error } = await this.supabase
      .from("roleplay_sessions")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw new Error(`Failed to fetch roleplay sessions metadata: ${error.message}`);
    }

    return mapRoleplaySessionsMetadataRowToEntity(count ?? 0);
  }

  async findMany(params: FindRoleplaySessionsParams = {}): Promise<RoleplaySession[]> {
    const sessionIds = params.tagNormalizedName
      ? await this.findSessionIdsByTag(params.tagNormalizedName)
      : null;

    if (sessionIds && sessionIds.length === 0) {
      return [];
    }

    let query = this.supabase
      .from("roleplay_sessions")
      .select("*")
      .order("updated_at", { ascending: false });

    if (params.states) {
      query = query.in("status", [...params.states]);
    } else {
      query = query.eq("status", SessionState.IN_PROGRESS);
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
      throw new Error(`Failed to fetch roleplay sessions: ${error.message}`);
    }

    if (!sessions.length) {
      return [];
    }

    const ids = sessions.map((session) => session.id as SessionId);
    const [tags, lines] = await Promise.all([
      this.findTagsBySessionIds(ids),
      this.findLinesBySessionIds(ids),
    ]);

    return sessions.map((session) =>
      mapRoleplaySessionRowToEntity({
        session,
        tags: tags.filter((tag) => tag.session_id === session.id),
        lines: lines.filter((line) => line.session_id === session.id),
      }),
    );
  }

  private async findSessionIdsByTag(normalizedName: string): Promise<SessionId[]> {
    const { data, error } = await this.supabase
      .from("roleplay_session_tags")
      .select("session_id")
      .eq("normalized_name", normalizedName);

    if (error) {
      throw new Error(`Failed to fetch roleplay session tags: ${error.message}`);
    }

    return data.map((row) => row.session_id as SessionId);
  }

  private async findTagsBySessionId(sessionId: SessionId): Promise<RoleplaySessionTagRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_session_tags")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch roleplay session tags: ${error.message}`);
    }

    return data;
  }

  private async findLinesBySessionId(sessionId: SessionId): Promise<RoleplaySessionLineRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_session_lines")
      .select("*")
      .eq("session_id", sessionId);

    if (error) {
      throw new Error(`Failed to fetch roleplay session lines: ${error.message}`);
    }

    return data;
  }

  private async findTagsBySessionIds(
    sessionIds: ReadonlyArray<SessionId>,
  ): Promise<RoleplaySessionTagRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_session_tags")
      .select("*")
      .in("session_id", [...sessionIds]);

    if (error) {
      throw new Error(`Failed to fetch roleplay session tags: ${error.message}`);
    }

    return data;
  }

  private async findLinesBySessionIds(
    sessionIds: ReadonlyArray<SessionId>,
  ): Promise<RoleplaySessionLineRow[]> {
    const { data, error } = await this.supabase
      .from("roleplay_session_lines")
      .select("*")
      .in("session_id", [...sessionIds]);

    if (error) {
      throw new Error(`Failed to fetch roleplay session lines: ${error.message}`);
    }

    return data;
  }

  async createSession(snapshot: CreateRoleplaySessionSnapshot): Promise<RoleplaySession> {
    const { material, selectedLearnerSpeakerId, partnerVoice, speechSpeed } = snapshot;
    const [speakerOne, speakerTwo] = material.speakers;
    const selectedLearnerSpeakerOrder = resolveSpeakerOrder(
      material.speakers,
      selectedLearnerSpeakerId,
    );

    const { data: session, error: sessionError } = await this.supabase
      .from("roleplay_sessions")
      .insert({
        user_id: material.ownerId,
        material_id: material.id,
        material_title_snapshot: material.title,
        situation_snapshot: material.situation,
        speaker_one_name_snapshot: speakerOne.displayName,
        speaker_two_name_snapshot: speakerTwo.displayName,
        selected_learner_speaker_order: selectedLearnerSpeakerOrder,
        partner_voice: partnerVoice,
        speech_speed: speechSpeed,
        current_line_order: 0,
        status: SessionState.READY,
        started_at: null,
      })
      .select("*")
      .single();

    if (sessionError || !session) {
      throw new Error(`Failed to create roleplay session: ${sessionError?.message}`);
    }

    try {
      const tagsResult =
        material.tags.length === 0
          ? { data: [] as RoleplaySessionTagRow[], error: null }
          : await this.supabase
              .from("roleplay_session_tags")
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
        throw new Error(`Failed to create roleplay session tags: ${tagsResult.error.message}`);
      }

      const { data: lines, error: linesError } = await this.supabase
        .from("roleplay_session_lines")
        .insert(
          material.lines.map((line) => ({
            session_id: session.id,
            user_id: material.ownerId,
            line_order: line.order,
            speaker_order: resolveSpeakerOrder(material.speakers, line.speakerId),
            text_snapshot: line.text,
            translation_snapshot: line.translation,
          })),
        )
        .select("*");

      if (linesError || !lines) {
        throw new Error(`Failed to create roleplay session lines: ${linesError?.message}`);
      }

      return mapRoleplaySessionRowToEntity({
        session,
        tags: tagsResult.data ?? [],
        lines,
      });
    } catch (error) {
      await this.supabase.from("roleplay_sessions").delete().eq("id", session.id);
      throw error;
    }
  }
}

function resolveSpeakerOrder(
  speakers: CreateRoleplaySessionSnapshot["material"]["speakers"],
  speakerId: SpeakerId,
): 1 | 2 {
  const speaker = speakers.find((item) => item.id === speakerId);

  if (!speaker) {
    throw new Error(`Unknown roleplay speaker: ${speakerId}`);
  }

  return speaker.order;
}

export function createRoleplaySessionRepository(
  supabase: SupabaseClient<Database>,
): RoleplaySessionRepositoryPort {
  return new RoleplaySessionRepository(supabase);
}
