"use client";

import { useRef, useState } from "react";

import { AudioCapture, AudioCaptureError, type CapturedAudio } from "@/shared/lib/audio";

type PracticeType = "roleplay" | "memorization";

export function TestAnalysisView() {
  const recorderRef = useRef<AudioCapture | null>(null);
  const [practiceType, setPracticeType] = useState<PracticeType>("roleplay");
  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [capturedAudio, setCapturedAudio] = useState<CapturedAudio | null>(null);
  const [jobId, setJobId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [payload, setPayload] = useState<unknown>(null);

  async function startRecording() {
    const recorder = new AudioCapture();
    recorderRef.current = recorder;
    setIsBusy(true);

    try {
      await recorder.start();
      setCapturedAudio(null);
      setPayload(null);
      setMessage("녹음 중");
      setIsRecording(true);
    } catch (error) {
      recorder.cancel();
      recorderRef.current = null;
      setIsRecording(false);
      setMessage(formatAudioCaptureError(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function stopRecording() {
    const recorder = recorderRef.current;

    if (!recorder) {
      return;
    }

    setIsBusy(true);

    try {
      const audio = await recorder.stop();
      setCapturedAudio(audio);
      setIsRecording(false);
      setMessage(`${Math.round(audio.durationMs / 1000)}초 녹음 완료`);
    } catch (error) {
      setMessage(formatAudioCaptureError(error));
    } finally {
      recorderRef.current = null;
      setIsRecording(false);
      setIsBusy(false);
    }
  }

  async function uploadAndRequest() {
    if (!capturedAudio) {
      setMessage("먼저 녹음이 필요합니다.");
      return;
    }

    setIsBusy(true);
    setMessage("업로드 및 job 요청 중");

    try {
      const formData = new FormData();
      const file = new File([capturedAudio.blob], `test-recording.${capturedAudio.extension}`, {
        type: capturedAudio.mimeType,
      });
      formData.set("file", file);
      formData.set("userId", userId);
      formData.set("practiceType", practiceType);
      formData.set("sessionId", sessionId);
      formData.set("targetId", targetId);
      formData.set("durationMs", String(capturedAudio.durationMs));

      const result = await postJson("/api/test-analysis", formData);
      const nextJobId = readNestedString(result, "job", "id");
      setJobId(nextJobId);
      setPayload(result);
      setMessage(nextJobId ? `job 요청 완료: ${nextJobId}` : "job 요청 완료");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 실패");
    } finally {
      setIsBusy(false);
    }
  }

  async function createTestFixture() {
    setIsBusy(true);
    setMessage("테스트 UUID 생성 중");

    try {
      const result = await postJson("/api/test-analysis/fixture");
      setPracticeType("roleplay");
      setUserId(readStringValue(result, "userId"));
      setSessionId(readStringValue(result, "sessionId"));
      setTargetId(readStringValue(result, "targetId"));
      setPayload(result);
      setMessage("테스트 UUID 생성 완료");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "테스트 UUID 생성 실패");
    } finally {
      setIsBusy(false);
    }
  }

  async function invokeProcessor() {
    setIsBusy(true);
    setMessage("processor 실행 중");

    try {
      const result = await postJson("/api/test-analysis/invoke");
      setPayload(result);
      setMessage("processor 응답 수신");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "processor 실행 실패");
    } finally {
      setIsBusy(false);
    }
  }

  async function refreshStatus() {
    if (!jobId) {
      setMessage("jobId가 필요합니다.");
      return;
    }

    setIsBusy(true);

    try {
      const response = await fetch(`/api/test-analysis/status?jobId=${encodeURIComponent(jobId)}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "상태 조회 실패");
      }

      setPayload(result);
      setMessage(`job 상태: ${result.job?.status ?? "unknown"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "상태 조회 실패");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-background px-6 py-8 text-black-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <header>
          <h1 className="text-heading-md font-semibold">Analysis Processor Test</h1>
        </header>

        <section className="grid gap-3 rounded-lg border border-gray-border bg-white p-4">
          <label className="grid gap-1 text-body-3">
            Practice type
            <select
              className="h-10 rounded-md border border-gray-border px-3"
              value={practiceType}
              onChange={(event) => setPracticeType(event.target.value as PracticeType)}
            >
              <option value="roleplay">roleplay</option>
              <option value="memorization">memorization</option>
            </select>
          </label>

          <TextInput label="User ID" value={userId} onChange={setUserId} />
          <TextInput label="Session ID" value={sessionId} onChange={setSessionId} />
          <TextInput
            label={practiceType === "roleplay" ? "Roleplay line ID" : "Memorization sentence ID"}
            value={targetId}
            onChange={setTargetId}
          />
        </section>

        <section className="flex flex-wrap gap-2">
          <button
            className="h-10 rounded-md border border-gray-border bg-white px-4 disabled:opacity-50"
            disabled={isBusy}
            onClick={createTestFixture}
          >
            테스트 UUID 생성
          </button>
          <button
            className="h-10 rounded-md bg-blue-primary px-4 text-white disabled:opacity-50"
            disabled={isRecording || isBusy}
            onClick={startRecording}
          >
            녹음 시작
          </button>
          <button
            className="h-10 rounded-md border border-gray-border bg-white px-4 disabled:opacity-50"
            disabled={!isRecording || isBusy}
            onClick={stopRecording}
          >
            녹음 정지
          </button>
          <button
            className="h-10 rounded-md bg-green-primary px-4 text-white disabled:opacity-50"
            disabled={!capturedAudio || isBusy}
            onClick={uploadAndRequest}
          >
            업로드 + Job 요청
          </button>
          <button
            className="h-10 rounded-md bg-black-primary px-4 text-white disabled:opacity-50"
            disabled={isBusy}
            onClick={invokeProcessor}
          >
            Processor 실행
          </button>
          <button
            className="h-10 rounded-md border border-gray-border bg-white px-4 disabled:opacity-50"
            disabled={!jobId || isBusy}
            onClick={refreshStatus}
          >
            상태 조회
          </button>
        </section>

        <label className="grid gap-1 text-body-3">
          Job ID
          <input
            className="h-10 rounded-md border border-gray-border px-3"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          />
        </label>

        {message ? <p className="text-body-4 text-blue-focus-title">{message}</p> : null}

        <pre className="min-h-64 overflow-auto rounded-lg border border-gray-border bg-white p-4 text-body-2">
          {payload ? JSON.stringify(payload, null, 2) : "No payload"}
        </pre>
      </div>
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-body-3">
      {label}
      <input
        className="h-10 rounded-md border border-gray-border px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

async function postJson(path: string, body?: BodyInit): Promise<Record<string, unknown>> {
  const response = await fetch(path, {
    method: "POST",
    body,
  });
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(result.error || "Request failed");
  }

  return result;
}

function readNestedString(
  value: Record<string, unknown>,
  objectKey: string,
  valueKey: string,
): string {
  const nested = value[objectKey];

  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return "";
  }

  const result = (nested as Record<string, unknown>)[valueKey];
  return typeof result === "string" ? result : "";
}

function readStringValue(value: Record<string, unknown>, key: string): string {
  const result = value[key];
  return typeof result === "string" ? result : "";
}

function formatAudioCaptureError(error: unknown): string {
  if (!(error instanceof AudioCaptureError)) {
    return "녹음 처리 중 알 수 없는 오류가 발생했습니다.";
  }

  switch (error.code) {
    case "permission-denied":
      return "마이크 권한이 거부되었습니다. 브라우저와 macOS 개인정보 보호 설정에서 마이크 권한을 허용해주세요.";
    case "device-not-found":
      return "사용 가능한 마이크를 찾지 못했습니다. 입력 장치 연결과 macOS 사운드 입력 설정을 확인해주세요.";
    case "recorder-unavailable":
      return "현재 주소에서는 브라우저 녹음을 사용할 수 없습니다. localhost 또는 HTTPS 주소에서 /test를 열어주세요.";
    case "unsupported-format":
      return "현재 브라우저가 지원하는 녹음 포맷을 찾지 못했습니다. Chrome 또는 Safari 최신 버전으로 다시 시도해주세요.";
    case "empty-audio-data":
      return "녹음된 오디오 데이터가 없습니다. 조금 더 길게 녹음한 뒤 다시 시도해주세요.";
    default:
      return error.message;
  }
}
