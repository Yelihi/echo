export function audioPreparationFailureMessage(code: string) {
  if (code === "UNAUTHORIZED") return "로그인이 만료됐어요. 다시 로그인해 주세요.";
  if (code === "INVALID_INPUT") return "예문 정보를 확인할 수 없어요. 페이지를 새로고침해 주세요.";
  if (code === "NOT_INVITED") return "이 계정은 AI 음성 기능을 사용할 권한이 없어요.";
  if (code === "RATE_LIMITED")
    return "음성 생성 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요.";
  if (code === "PROCESSOR_UNAVAILABLE")
    return "음성 생성 서버에 연결하지 못했어요. 예문은 저장되어 있어요.";
  if (code === "REGISTRATION_FAILED")
    return "음성 준비 요청을 등록하지 못했어요. 예문은 저장되어 있어요.";
  if (code === "GENERATION_FAILED")
    return "음성을 생성하지 못했어요. 음성 준비를 다시 요청해 주세요.";
  return "음성 상태를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export const isAudioPreparationActive = (status?: string) =>
  status === "queued" || status === "processing";
