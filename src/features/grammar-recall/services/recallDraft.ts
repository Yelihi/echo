import { GRAMMAR_ANSWER_MAX_LENGTH } from "@/entities/grammar-session";
import type { GrammarSession, GrammarSessionQuestion } from "@/entities/grammar-session";
import type { RecallDraft, RecallSegment } from "../models/interface";

export function createRecallSegments(question: GrammarSessionQuestion): RecallSegment[] {
  const sentence = question.sentence ?? "";
  const chunks = question.chunks;

  if (chunks.length < 2)
    return [
      { id: `${question.id}-whole`, text: sentence, hidden: true, meaning: question.translation },
    ];

  const segments: RecallSegment[] = [];
  let cursor = 0;

  for (const [index, chunk] of chunks.entries()) {
    if (chunk.start < cursor || chunk.end > sentence.length || chunk.end <= chunk.start) continue;

    if (chunk.start > cursor)
      segments.push({
        id: `gap-${cursor}`,
        text: sentence.slice(cursor, chunk.start),
        hidden: false,
        meaning: "",
      });

    segments.push({
      id: chunk.id,
      text: sentence.slice(chunk.start, chunk.end),
      hidden: index > 0,
      meaning: chunk.meaning,
    });
    cursor = chunk.end;
  }

  if (cursor < sentence.length)
    segments.push({
      id: `gap-${cursor}`,
      text: sentence.slice(cursor),
      hidden: false,
      meaning: "",
    });

  return segments;
}

function isRecallDraft(value: unknown): value is RecallDraft {
  if (!value || typeof value !== "object") return false;

  const draft = value as Partial<RecallDraft>;

  return (
    typeof draft.whole === "string" &&
    draft.whole.length <= GRAMMAR_ANSWER_MAX_LENGTH &&
    !!draft.values &&
    Object.values(draft.values).every(
      (value) => typeof value === "string" && value.length <= GRAMMAR_ANSWER_MAX_LENGTH,
    ) &&
    (draft.assessment === null || draft.assessment === "remembered" || draft.assessment === "again")
  );
}

export function getRecallDraftKey(session: GrammarSession) {
  return `echo:grammar-recall:${session.id}:${session.phase}:${session.questionIndex}`;
}

export function readRecallDraft(session: GrammarSession): RecallDraft {
  const question = session.questions[session.questionIndex];
  let draft: RecallDraft = {
    values: {},
    whole: session.answers[`whole:${question.id}`] ?? "",
    assessment: null,
  };

  try {
    const partial = JSON.parse(session.answers[`partial:${question.id}`] ?? "null");

    if (partial && typeof partial === "object" && partial.values)
      draft = { ...draft, values: partial.values, assessment: partial.assessment ?? null };
  } catch {
    /* 이전 버전의 단순 문자열 답안은 빈칸 초안으로 해석하지 않는다. */
  }

  try {
    const local = JSON.parse(sessionStorage.getItem(getRecallDraftKey(session)) ?? "null");

    if (local?.version === session.version && isRecallDraft(local.draft)) return local.draft;
  } catch {
    /* 저장소를 사용할 수 없으면 서버에 저장된 답안으로 계속한다. */
  }

  return isRecallDraft(draft) ? draft : { values: {}, whole: "", assessment: null };
}

export function persistRecallDraft(session: GrammarSession, draft: RecallDraft) {
  try {
    sessionStorage.setItem(
      getRecallDraftKey(session),
      JSON.stringify({ version: session.version, draft }),
    );
  } catch {
    /* 브라우저 저장 공간이 없더라도 서버 저장과 입력을 막지 않는다. */
  }
}

export function mergeRecallDraftIntoAnswers(session: GrammarSession, draft: RecallDraft) {
  const id = session.questions[session.questionIndex].id;

  return {
    ...session.answers,
    [`partial:${id}`]: JSON.stringify({ values: draft.values, assessment: draft.assessment }),
    ...(session.phase === "whole" ? { [`whole:${id}`]: draft.whole } : {}),
  };
}
