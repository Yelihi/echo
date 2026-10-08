/** @jest-environment node */
import { describe, expect, it, jest } from "@jest/globals";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import type { GrammarNoteContent } from "../../models/entity";
import { GrammarNoteRepository } from "../GrammarNoteRepository";
import { mapGrammarNoteContentToJson } from "../../models/mapper";

const id = "11111111-1111-4111-8111-111111111111";
const ownerId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";

function content(): GrammarNoteContent {
  return {
    source: { sentence: "She is a doctor.", learningNote: "주격 보어", revision: 2 },
    metadata: {
      source: "ai",
      sourceRevision: 2,
      title: "주격 보어",
      tags: ["보어"],
      grammarKey: null,
    },
    analysis: {
      sourceText: "She is a doctor.",
      sourceRevision: 2,
      reviewStatus: "reviewed",
      chunks: [
        {
          id: "chunk",
          range: { start: 0, end: 16 },
          literalMeaning: "그녀는 의사이다.",
          explanation: "",
        },
      ],
      syntax: [],
      constructions: [],
      naturalTranslation: "그녀는 의사입니다.",
    },
    examples: [],
  };
}
function row() {
  return {
    id,
    owner_id: ownerId,
    content: content(),
    version: 1,
    created_at: "2026-10-06T00:00:00+00:00",
    updated_at: "2026-10-06T00:00:00+00:00",
  };
}
function summary() {
  const note = row();
  return {
    id: note.id,
    owner_id: note.owner_id,
    version: note.version,
    created_at: note.created_at,
    updated_at: note.updated_at,
    title: note.content.metadata.title,
    sentence: note.content.source.sentence,
    tags: note.content.metadata.tags,
  };
}
// Supabase query builder는 실제 구현을 쓰고 HTTP 경계만 대체한다.
function setup(data: unknown, status = 200) {
  const fetcher = jest.fn<typeof fetch>().mockImplementation(
    async () =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
  const client = createClient<Database>("https://echo-test.example", "test-anon-key", {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: fetcher },
  });
  return { repository: new GrammarNoteRepository(client), fetcher };
}

describe("GrammarNoteRepository", () => {
  it("sends the same creation key on retries and returns the DB-owned identity/version", async () => {
    // Given
    const { repository, fetcher } = setup(row());
    // When
    const first = await repository.create({ requestId, content: content() });
    const retry = await repository.create({ requestId, content: content() });
    // Then: idempotency 자체는 DB 테스트에서 검증하며 여기서는 동일 키/입력 전달을 검증한다.
    expect(first).toEqual(retry);
    expect(first).toMatchObject({ id, ownerId, version: 1, source: content().source });
    for (const [url, init] of fetcher.mock.calls) {
      expect(String(url)).toContain("/rpc/create_grammar_note");
      expect(JSON.parse(String(init?.body))).toEqual({
        p_request_id: requestId,
        p_content: content(),
      });
    }
  });

  it("sends the expected version and maps the committed version from the update response", async () => {
    // Given
    const { repository, fetcher } = setup({ ...row(), version: 2 });
    // When
    const result = await repository.update({ id, expectedVersion: 1, content: content() });
    // Then
    expect(result.version).toBe(2);
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({
      p_note_id: id,
      p_expected_version: 1,
      p_content: content(),
    });
  });

  it("reads only the public note fields and converts a visible row", async () => {
    const { repository, fetcher } = setup([row()]);
    const result = await repository.findById(id);
    expect(result).toMatchObject({ id, ownerId, analysis: content().analysis });
    const url = new URL(String(fetcher.mock.calls[0][0]));
    expect(url.searchParams.get("id")).toBe(`eq.${id}`);
    expect(url.searchParams.get("select")).toBe(
      "id,owner_id,content,version,created_at,updated_at",
    );
  });

  it("returns null for a row hidden by RLS or an unknown id", async () => {
    const { repository } = setup([]);
    await expect(repository.findById(id)).resolves.toBeNull();
  });

  it("retains DB ordering/count and passes a literal search string with bounded pagination", async () => {
    // Given
    const { repository, fetcher } = setup({ items: [summary()], total: 21 });
    // When
    const result = await repository.findMany({ page: 2, pageSize: 10, query: "  50%_(be)  " });
    // Then
    expect(result).toEqual({
      page: 2,
      pageSize: 10,
      total: 21,
      items: [
        {
          id,
          ownerId,
          version: 1,
          createdAt: row().created_at,
          updatedAt: row().updated_at,
          title: "주격 보어",
          sentence: "She is a doctor.",
          tags: ["보어"],
        },
      ],
    });
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toEqual({
      p_page: 2,
      p_page_size: 10,
      p_query: "50%_(be)",
    });
    expect(result.items[0]).not.toHaveProperty("analysis");
  });

  it("preserves total on an out-of-range empty page and supplies defaults", async () => {
    const { repository, fetcher } = setup({ items: [], total: 3 });
    await expect(repository.findMany({ page: 10 })).resolves.toEqual({
      items: [],
      total: 3,
      page: 10,
      pageSize: 20,
    });
    await repository.findMany();
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body))).toEqual({
      p_page: 1,
      p_page_size: 20,
      p_query: "",
    });
  });

  it.each([
    { page: 0 },
    { page: 1.5 },
    { pageSize: 101 },
    { pageSize: 0 },
    { query: "a".repeat(201) },
  ])("rejects invalid pagination before a request: %j", async (params) => {
    const { repository, fetcher } = setup(null);
    await expect(repository.findMany(params)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("rejects invalid ids, versions, and stale content before any DB request", async () => {
    const { repository, fetcher } = setup(null);
    const stale = { ...content(), source: { ...content().source, revision: 3 } };
    await expect(repository.findById("invalid")).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(
      repository.create({ requestId: "invalid", content: content() }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
    await expect(repository.create({ requestId, content: stale })).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
    await expect(
      repository.update({ id, expectedVersion: 0, content: content() }),
    ).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    "UNAUTHORIZED",
    "NOT_FOUND",
    "VERSION_CONFLICT",
    "IDEMPOTENCY_CONFLICT",
    "INVALID_INPUT",
  ])("maps the DB %s contract without exposing SQL details", async (code) => {
    const raw = {
      code: "P0001",
      message: `GRAMMAR_NOTE_${code}`,
      details: "private SQL details",
      hint: "",
    };
    const { repository } = setup(raw, 400);
    await expect(
      repository.update({ id, expectedVersion: 1, content: content() }),
    ).rejects.toMatchObject({ code, message: code, cause: raw });
  });

  it("keeps an unexpected DB error in cause for internal logging", async () => {
    const raw = { code: "XX000", message: "private DB text", details: "", hint: "" };
    const { repository } = setup(raw, 500);
    await expect(repository.create({ requestId, content: content() })).rejects.toMatchObject({
      code: "PERSISTENCE_FAILED",
      message: "PERSISTENCE_FAILED",
      cause: raw,
    });
  });

  it("handles a rejected HTTP request without leaking the network error as a UI message", async () => {
    const { repository, fetcher } = setup(null);
    fetcher.mockRejectedValue(new Error("private network text"));
    await expect(repository.findMany()).rejects.toMatchObject({
      code: "PERSISTENCE_FAILED",
      message: "PERSISTENCE_FAILED",
    });
  });

  it.each([
    null,
    { ...row(), version: 0 },
    {
      ...row(),
      content: { ...content(), analysis: { ...content().analysis, sourceRevision: 100 } },
    },
  ])("rejects malformed stored notes: %j", async (data) => {
    const { repository } = setup(data);
    await expect(repository.create({ requestId, content: content() })).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("does not turn a missing count or malformed list into a successful empty page", async () => {
    const { repository } = setup({ items: [] });
    await expect(repository.findMany()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("serializes nested ranges without mutating or normalizing the domain content", () => {
    const note: GrammarNoteContent = {
      ...content(),
      analysis: {
        ...content().analysis,
        syntax: [
          {
            id: "verb",
            parentId: null,
            role: "verb",
            label: "동사",
            explanation: "연결 동사",
            ranges: [{ start: 4, end: 6 }],
          },
        ],
        constructions: [
          {
            id: "be",
            name: "be + 보어",
            meaning: "~이다",
            explanation: "주어 설명",
            ranges: [{ start: 4, end: 15 }],
          },
        ],
      },
      examples: [
        {
          id: "example",
          sentence: "He is a nurse.",
          translation: "그는 간호사이다.",
          targetExplanation: "주격 보어",
          reviewStatus: "reviewed",
        },
      ],
    };
    const serialized = mapGrammarNoteContentToJson(note);
    expect(serialized).toEqual(note);
    expect(serialized).not.toBe(note);
    expect(note.source.sentence).toBe("She is a doctor.");
  });
});
