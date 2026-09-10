import "server-only";
import { observeOperation } from "@/shared/lib/logging/observeOperation";
import { recordOperationEvent } from "@/shared/lib/logging/pino";
import type { RecordOperationEvent } from "@/shared/lib/logging/models";
import type {
  AcceptDraftRecordingWorkflowInput,
  CreateDraftRecordingWorkflowInput,
} from "../../models/workflows";
import {
  acceptDraftRecording as acceptDraft,
  createDraftRecording as createDraft,
} from "./workflows";

export function createDraftRecording(
  input: CreateDraftRecordingWorkflowInput,
  recordEvent: RecordOperationEvent = recordOperationEvent,
): ReturnType<typeof createDraft> {
  return observeOperation({
    operation: "recording.draft.create",
    resourceId: input.target.sessionId,
    recordEvent,
    execute: () => createDraft(input),
  });
}

export function acceptDraftRecording(
  input: AcceptDraftRecordingWorkflowInput,
  recordEvent: RecordOperationEvent = recordOperationEvent,
): ReturnType<typeof acceptDraft> {
  return observeOperation({
    operation: "recording.draft.accept",
    resourceId: input.draftRecordingId,
    recordEvent,
    execute: () => acceptDraft(input),
  });
}
