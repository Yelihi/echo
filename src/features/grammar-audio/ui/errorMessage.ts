import type { GrammarAudioErrorCode } from "../models/interface";
export const grammarAudioErrorMessages: Record<GrammarAudioErrorCode, string> = {
  INVALID_INPUT: "음성 요청을 확인해주세요.",
  UNAUTHORIZED: "로그인 후 다시 시도해주세요.",
  NOT_INVITED: "AI 음성 이용 권한이 필요합니다.",
  RATE_LIMITED: "음성 요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.",
  GENERATION_FAILED:
    "음성을 생성하지 못했습니다. 노트가 변경되었다면 새로고침 후 다시 생성해주세요.",
  PLAYBACK_FAILED: "음성을 재생하지 못했습니다. 재생 버튼을 다시 눌러주세요.",
};
