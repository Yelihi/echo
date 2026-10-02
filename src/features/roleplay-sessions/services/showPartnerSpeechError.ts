import { errorPopupManager } from "@/shared/lib/error-popup";

export function showPartnerSpeechError(code: string): void {
  errorPopupManager.open({
    title: "음성을 재생하지 못했습니다",
    message:
      code === "TTS-005"
        ? "AI 음성은 초대된 계정에서 사용할 수 있습니다."
        : code === "TTS-004"
          ? "음성 요청은 분당 20회까지 가능합니다. 잠시 후 다시 시도해주세요."
          : "잠시 후 다시 시도해주세요.",
    code,
  });
}
