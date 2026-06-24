import type { LineId, SentenceId, SessionId } from "@/entities/value-object";

import { PracticeType } from "@/entities/practice-target/models/enums";
import type { PracticeTarget } from "@/entities/practice-target/models/value-object";

export interface PracticeTargetFields {
  readonly id: string;
  readonly roleplay_session_id: string | null;
  readonly roleplay_line_id: string | null;
  readonly memorization_session_id: string | null;
  readonly memorization_sentence_id: string | null;
}

export interface SessionPracticeTargetFields {
  readonly id: string;
  readonly roleplay_session_id: string | null;
  readonly memorization_session_id: string | null;
}

export interface SessionPracticeTarget {
  readonly practiceType: PracticeType;
  readonly sessionId: SessionId;
}

export function mapPracticeTargetFields(
  fields: PracticeTargetFields,
  errorLabel: string,
): PracticeTarget {
  if (fields.roleplay_session_id && fields.roleplay_line_id) {
    assertNoMemorizationTarget(fields, errorLabel);

    return {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: fields.roleplay_session_id as SessionId,
      lineSnapshotId: fields.roleplay_line_id as LineId,
    };
  }

  if (fields.memorization_session_id && fields.memorization_sentence_id) {
    assertNoRoleplayTarget(fields, errorLabel);

    return {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: fields.memorization_session_id as SessionId,
      sentenceSnapshotId: fields.memorization_sentence_id as SentenceId,
    };
  }

  throw new Error(`Invalid ${errorLabel} target: ${fields.id}`);
}

export function mapSessionPracticeTargetFields(
  fields: SessionPracticeTargetFields,
  errorLabel: string,
): SessionPracticeTarget {
  if (fields.roleplay_session_id) {
    if (fields.memorization_session_id) {
      throw new Error(`Invalid ${errorLabel} session target: ${fields.id}`);
    }

    return {
      practiceType: PracticeType.ROLEPLAY,
      sessionId: fields.roleplay_session_id as SessionId,
    };
  }

  if (fields.memorization_session_id) {
    return {
      practiceType: PracticeType.MEMORIZATION,
      sessionId: fields.memorization_session_id as SessionId,
    };
  }

  throw new Error(`Invalid ${errorLabel} session target: ${fields.id}`);
}

function assertNoMemorizationTarget(fields: PracticeTargetFields, errorLabel: string): void {
  if (fields.memorization_session_id || fields.memorization_sentence_id) {
    throw new Error(`Invalid ${errorLabel} target: ${fields.id}`);
  }
}

function assertNoRoleplayTarget(fields: PracticeTargetFields, errorLabel: string): void {
  if (fields.roleplay_session_id || fields.roleplay_line_id) {
    throw new Error(`Invalid ${errorLabel} target: ${fields.id}`);
  }
}
