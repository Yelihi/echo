export type PracticeType = "roleplay" | "memorization";

export type AnalysisJob = {
  id: string;
  user_id: string;
  roleplay_session_id: string | null;
  memorization_session_id: string | null;
};

export type AcceptedRecording = {
  roleplay_session_id: string | null;
  roleplay_line_id: string | null;
  memorization_session_id: string | null;
  memorization_sentence_id: string | null;
  bucket_id: string;
  object_path: string;
  mime_type: string;
};

export type Target = {
  recording: AcceptedRecording;
  expectedText: string;
};

export type DiffSegment = {
  op: "equal" | "insert" | "delete" | "replace";
  expected?: string;
  actual?: string;
};

export type Evaluation = {
  feedback: string;
  score: number | null;
  diff: DiffSegment[];
};
