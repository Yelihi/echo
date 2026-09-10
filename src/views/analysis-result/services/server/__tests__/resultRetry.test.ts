import { expect, it } from "@jest/globals";
import { createRoleplayResultPageViewModel } from "../roleplayResultPageConverter";
import { PracticeType } from "@/entities/practice-target";
import { AnalysisJobState, type AnalysisJob } from "@/entities/analysis-job";
import {
  RoleplayPartnerVoice,
  SessionState,
  type RoleplaySession,
} from "@/entities/roleplay-session";
import type { AnalysisJobId, LineId, SessionId, SpeakerId, UserId } from "@/entities/value-object";

const sessionId = "session" as SessionId;
const ownerId = "owner" as UserId;
const session: RoleplaySession = {
  id: sessionId,
  ownerId,
  sourceMaterialId: null,
  materialTitleSnapshot: "Test",
  situationSnapshot: "Test",
  tagsSnapshot: [],
  selectedLearnerSpeakerOrder: 2,
  partnerVoice: RoleplayPartnerVoice.EMMA,
  speechSpeed: 1,
  evaluationMode: "context",
  speakerSnapshots: [
    { id: "speaker1" as SpeakerId, order: 1, displayName: "Partner" },
    { id: "speaker2" as SpeakerId, order: 2, displayName: "Me" },
  ],
  lineSnapshots: [
    { id: "line" as LineId, order: 0, speakerOrder: 2, text: "Hello", translation: null },
  ],
  currentLineOrder: 0,
  state: SessionState.COMPLETED,
  startedAt: null,
  completedAt: null,
  deletedAt: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

it.each([
  { state: AnalysisJobState.COMPLETED, resultState: "partial", canRetry: false },
  { state: AnalysisJobState.FAILED, resultState: "failed", canRetry: true },
] as const)(
  "작업 $state와 누락된 결과에 맞는 재시도 가능 여부를 계산한다",
  ({ state, resultState, canRetry }) => {
    const job: AnalysisJob = {
      id: "job" as AnalysisJobId,
      ownerId,
      sessionId,
      practiceType: PracticeType.ROLEPLAY,
      state,
      provider: "openai",
      attemptNumber: 1,
      queuedAt: new Date(0),
      startedAt: null,
      completedAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      errorLogRef: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    };
    const viewModel = createRoleplayResultPageViewModel({
      session,
      job,
      sourceResults: [],
      audioByLineId: new Map(),
    });
    expect(viewModel.result.state).toBe(resultState);
    expect(viewModel.canRetry).toBe(canRetry);
  },
);
