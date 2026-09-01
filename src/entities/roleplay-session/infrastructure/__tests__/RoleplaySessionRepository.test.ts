import { describe, expect, it, jest } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";

// shared
import type { Database } from "@/shared/lib/supabase";

// entities
import type { RoleplayMaterial } from "@/entities/roleplay-material";
import { MaterialState } from "@/entities/roleplay-material/models/enums";
import { RoleplaySessionRepository } from "@/entities/roleplay-session/infrastructure/RoleplaySessionRepository";
import { RoleplayPartnerVoice } from "@/entities/roleplay-session/models/enums";
import type {
  RoleplaySessionLineRow,
  RoleplaySessionRow,
  RoleplaySessionTagRow,
} from "@/entities/roleplay-session/models/mapper";
import type { LineId, MaterialId, SpeakerId, UserId } from "@/entities/value-object";

describe("RoleplaySessionRepository", () => {
  it("should create a session snapshot with tags and lines", async () => {
    const session = createSessionRow();
    const tags = [createTagRow()];
    const lines = [createLineRow()];
    const sessionQuery = createMutationQuery(queryResult(session));
    const tagQuery = createMutationQuery(queryResult(tags));
    const lineQuery = createMutationQuery(queryResult(lines));
    const { client, from, rpc } = createSupabaseStub(
      {
        roleplay_sessions: [sessionQuery],
        roleplay_session_tags: [tagQuery],
        roleplay_session_lines: [lineQuery],
      },
      queryResult(session.id),
    );
    const repository = new RoleplaySessionRepository(client);
    const material = createMaterial();

    const result = await repository.createSession({
      material,
      selectedLearnerSpeakerId: material.speakers[1].id,
      partnerVoice: RoleplayPartnerVoice.JAMES,
      speechSpeed: 0.9,
    });

    expect(result).toMatchObject({
      id: session.id,
      sourceMaterialId: material.id,
      materialTitleSnapshot: material.title,
      selectedLearnerSpeakerOrder: 2,
      partnerVoice: "james",
      speechSpeed: 0.9,
      tagsSnapshot: [{ displayName: "Airport", normalizedName: "airport" }],
      lineSnapshots: [{ text: lines[0].text_snapshot, speakerOrder: 1 }],
      state: "ready",
    });
    expect(rpc).toHaveBeenCalledWith("create_roleplay_session_snapshot", {
      p_material_id: material.id,
      p_material_title: material.title,
      p_situation: material.situation,
      p_speaker_one_name: "Staff",
      p_speaker_two_name: "Passenger",
      p_selected_learner_speaker_order: 2,
      p_partner_voice: RoleplayPartnerVoice.JAMES,
      p_speech_speed: 0.9,
      p_tags: [{ display_name: "Airport", normalized_name: "airport" }],
      p_lines: [
        {
          line_order: 0,
          speaker_order: 1,
          text_snapshot: "How can I help you?",
          translation_snapshot: null,
        },
      ],
    });
    expect(from).toHaveBeenNthCalledWith(1, "roleplay_sessions");
    expect(from).toHaveBeenNthCalledWith(2, "roleplay_session_tags");
    expect(from).toHaveBeenNthCalledWith(3, "roleplay_session_lines");
    expect(sessionQuery.maybeSingle).toHaveBeenCalled();
  });
});

interface QueryError {
  readonly message: string;
}

interface QueryResult<TData> {
  readonly data: TData;
  readonly error: QueryError | null;
  readonly count: number | null;
}

type QueryStub = ReturnType<typeof createMutationQuery>;
type QueryInput = QueryStub | QueryResult<unknown>;

function queryResult<TData>(
  data: TData,
  error: QueryError | null = null,
  count: number | null = null,
): QueryResult<TData> {
  return { data, error, count };
}

function createMutationQuery(result: QueryResult<unknown>) {
  const query = {
    insert: jest.fn(),
    delete: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(async () => result),
    maybeSingle: jest.fn(async () => result),
    then: (
      onFulfilled: (value: QueryResult<unknown>) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  query.insert.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);

  return query;
}

function createSupabaseStub(
  tableQueries: Record<string, QueryInput[]>,
  rpcResult: QueryResult<unknown> = queryResult(null),
) {
  const queues = Object.fromEntries(
    Object.entries(tableQueries).map(([table, queries]) => [
      table,
      queries.map((query) => ("select" in query ? query : createMutationQuery(query))),
    ]),
  ) as Record<string, QueryStub[]>;
  const from = jest.fn((table: string) => {
    const query = queues[table]?.shift();

    if (!query) {
      throw new Error(`Missing Supabase query stub for table: ${table}`);
    }

    return query;
  });
  const rpc = jest.fn(async () => rpcResult);

  return {
    client: { from, rpc } as unknown as SupabaseClient<Database>,
    from,
    rpc,
  };
}

function createMaterial(): RoleplayMaterial {
  const materialId = "99999999-9999-4999-8999-999999999999" as MaterialId;
  const partnerId = `${materialId}:speaker:1` as SpeakerId;
  const learnerId = `${materialId}:speaker:2` as SpeakerId;

  return {
    id: materialId,
    ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" as UserId,
    title: "Airport Check-in",
    situation: "Checking in at the airport counter.",
    tags: [{ displayName: "Airport", normalizedName: "airport" }],
    speakers: [
      { id: partnerId, order: 1, displayName: "Staff" },
      { id: learnerId, order: 2, displayName: "Passenger" },
    ],
    lines: [
      {
        id: "22222222-2222-4222-8222-222222222222" as LineId,
        order: 0,
        speakerId: partnerId,
        text: "How can I help you?",
        translation: null,
      },
    ],
    state: MaterialState.ACTIVE,
    deletedAt: null,
    createdAt: new Date("2026-06-13T00:00:00.000Z"),
    updatedAt: new Date("2026-06-13T00:10:00.000Z"),
  };
}

function createSessionRow(overrides: Partial<RoleplaySessionRow> = {}): RoleplaySessionRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    material_id: "99999999-9999-4999-8999-999999999999",
    material_title_snapshot: "Airport Check-in",
    situation_snapshot: "Checking in at the airport counter.",
    speaker_one_name_snapshot: "Staff",
    speaker_two_name_snapshot: "Passenger",
    selected_learner_speaker_order: 2,
    partner_voice: "james",
    speech_speed: 0.9,
    current_line_order: 0,
    status: "ready",
    started_at: null,
    completed_at: null,
    deleted_at: null,
    created_at: "2026-06-13T00:00:00.000Z",
    updated_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createTagRow(overrides: Partial<RoleplaySessionTagRow> = {}): RoleplaySessionTagRow {
  return {
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    display_name: "Airport",
    normalized_name: "airport",
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}

function createLineRow(overrides: Partial<RoleplaySessionLineRow> = {}): RoleplaySessionLineRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    session_id: "11111111-1111-4111-8111-111111111111",
    user_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    line_order: 0,
    speaker_order: 1,
    text_snapshot: "How can I help you?",
    translation_snapshot: null,
    created_at: "2026-06-13T00:00:00.000Z",
    ...overrides,
  };
}
