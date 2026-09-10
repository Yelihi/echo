import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadyRole,
  RoleplayReadyVoice,
  RoleplayReadySettings,
} from "@/features/roleplay-sessions/models/ready";
export type {
  RoleplayReadyRole,
  RoleplayReadyEvaluationMode,
  RoleplayReadyVoice,
  RoleplayReadyMaterial,
  RoleplayReadySettings,
} from "@/features/roleplay-sessions/models/ready";
// widgets
import type { SourceCardProps } from "@/widgets/source-card/models/interface";

// view
export interface RolePlayViewProps {
  page: number;
  tags: string[];
}

export interface RolePlayScriptEditorProps {
  isPending: boolean;
}

export interface RolePlayScriptLineListProps {
  isPending: boolean;
}

export interface GetRolePlaySessionsParams {
  page: number;
  limit?: number;
  tags?: string[];
}

export interface RolePlayMaterialListResult {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
  page: number;
  totalCount: number;
  totalPages: number;
}

export interface SourceCardsWrapperProps {
  cards: Omit<SourceCardProps, "onMenuAction" | "innerMenuItems">[];
}

export type RolePlaySessionTheme = "red" | "blue" | "green" | "yellow" | "black";

// editor
export type RoleplayEditorMode = "create" | "edit";

export type RoleplayEditorSpeaker = "partner" | "me";

export interface RoleplayEditorLineDraft {
  id: string;
  speaker: RoleplayEditorSpeaker;
  text: string;
}

export interface RoleplayEditorDraft {
  title: string;
  situation: string;
  tags: string[];
  lines: RoleplayEditorLineDraft[];
}

export interface RolePlayEditorViewProps {
  mode: RoleplayEditorMode;
  materialId?: string;
}

export type CreateRolePlayMaterialResult =
  | { code: "SUCCESS"; materialId: string }
  | { code: "RPM-001" }
  | { code: "RPM-002" }
  | { code: "RPM-003" };

export type CreateRolePlaySessionResult =
  | { code: "SUCCESS"; sessionId: string }
  | { code: "RPS-001" }
  | { code: "RPS-002" }
  | { code: "RPS-003" };

export interface RolePlayEditorStore {
  draft: RoleplayEditorDraft;
  edited: boolean;
  hydrate: (draft: RoleplayEditorDraft) => void;
  setTitle: (title: string) => void;
  setSituation: (situation: string) => void;
  setTags: (tags: string[]) => void;
  updateLineText: (lineId: string, text: string) => void;
  flipLineSpeaker: (lineId: string) => void;
  deleteLine: (lineId: string) => void;
  addLine: (speaker: RoleplayEditorSpeaker) => void;
  applyImportedScript: (lines: RoleplayEditorLineDraft[]) => void;
  markDirty: () => void;
  reset: () => void;
}

// ready

export interface CreateRolePlaySessionRequest {
  materialId: string;
  role: RoleplayReadyRole;
  voice: RoleplayReadyVoice;
  speed: number;
}

export interface RolePlayReadyViewProps {
  materialId: string;
}

export interface RolePlayReadyStore {
  settings: RoleplayReadySettings;
  setRole: (role: RoleplayReadyRole) => void;
  setEvaluationMode: (evaluationMode: RoleplayReadyEvaluationMode) => void;
  setVoice: (voice: RoleplayReadyVoice) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}
