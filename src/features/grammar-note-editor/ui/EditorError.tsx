"use client";
import { useEditor } from "./EditorProvider";
export function EditorError() {
  const error = useEditor((s) => s.error);
  if (!error) return null;
  let message: string;
  if ("message" in error) message = error.message;
  else {
    switch (error.code) {
      case "VERSION_CONFLICT":
        message = "다른 화면에서 노트가 변경되었습니다. 새로고침 후 다시 확인해 주세요.";
        break;
      case "UNAUTHORIZED":
        message = "로그인 후 다시 저장해 주세요.";
        break;
      case "ANALYSIS_FAILED":
        message = "분석을 완료하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.";
        break;
      case "INVALID_ANALYSIS":
        message = "분석과 입력을 다시 확인해 주세요.";
        break;
      default:
        message = "저장하지 못했습니다. 입력을 유지했으니 다시 저장해 주세요.";
    }
  }
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
