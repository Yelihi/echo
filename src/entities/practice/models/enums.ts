export enum PracticeType {
  ROLEPLAY = "roleplay",
  MEMORIZATION = "memorization",
}

export enum MaterialState {
  ACTIVE = "active",
  DELETED = "deleted",
}

export enum SessionState {
  READY = "ready",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  DELETED = "deleted",
}

export enum AnalysisJobState {
  QUEUED = "queued",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELED = "canceled",
}

export enum CleanupFailureSource {
  DRAFT_RECORDING = "draft_recording",
  ACCEPTED_RECORDING = "accepted_recording",
  SESSION_DELETE = "session_delete",
}
