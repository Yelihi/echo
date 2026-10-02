import type {
  MemorizationReadyMaterial,
  MemorizationReadyMode,
} from "@/features/memorization-sessions/models/ready";
import type { RecordingPanelContent } from "./ui";

export function getMemorizationPrompt(
  mode: MemorizationReadyMode,
  title: string,
  paragraph?: NonNullable<MemorizationReadyMaterial["previewLines"]>[number],
): RecordingPanelContent {
  if (mode === "title") return { kind: "title", title };
  const text = mode === "translate" ? paragraph?.translation : paragraph?.text;
  const available = Boolean(text?.trim());
  return {
    kind: "prompt",
    label: `${paragraph?.label ?? "연습 문단"} · ${mode === "translate" ? "번역 보고 말하기" : "본문 보고 말하기"}`,
    text: available
      ? text!.trim()
      : mode === "translate"
        ? "이 문단에는 저장된 번역이 없습니다. 본문 또는 제목 모드를 선택해주세요."
        : "연습할 본문을 찾지 못했습니다. 자료를 다시 열어주세요.",
    lang: available && mode === "read" ? "en" : "ko",
    unavailable: !available,
  };
}
