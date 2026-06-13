import type { SupabaseClient } from "@supabase/supabase-js";

import type { SessionId } from "@/entities/value-object";
import type { Database } from "@/shared/lib/supabase";
import type { RoleplaySession } from "@/entities/roleplay-session/models/entity";
import { SessionState } from "@/entities/roleplay-session/models/enums";
import {
  mapRoleplaySessionRowToEntity,
  type RoleplaySessionLineRow,
  type RoleplaySessionTagRow,
} from "@/entities/roleplay-session/models/mapper";
import type {
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
}

export function createRoleplaySessionRepository(
  supabase: SupabaseClient<Database>,
): RoleplaySessionRepositoryPort {
  return new RoleplaySessionRepository(supabase);
}
