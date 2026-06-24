# Audio Capture and Recording State Design

## Goal

브라우저별 `MediaRecorder` 차이를 흡수하는 공용 오디오 캡처 유틸과 녹음 상태 모델을 구현한다.

이 작업은 롤플레잉, 문장 암기, 이후 OpenAI STT 연동이 같은 녹음 결과 타입을 사용할 수 있게 만드는 내부 모듈이다.

## Scope

Included:

- `src/shared/lib/audio`: 브라우저 `MediaRecorder`와 `getUserMedia`를 감싸는 headless 오디오 캡처 모듈
- `src/shared/model/recording`: 녹음 상태와 상태 전이 reducer
- 브라우저 지원 포맷 선택 로직
- `record`, `stop`, `cancel`, `retry`에 대응되는 명령 인터페이스
- 0.8초 미만 녹음 discard
- 권한, 장치, 포맷, recorder 런타임 오류를 UI가 해석할 수 있는 에러 코드로 전달
- Jest 단위 테스트

Excluded:

- React hook
- 화면 UI
- Supabase Storage 업로드
- draft/accepted recording DB 저장
- OpenAI STT API 호출
- 실시간 STT 스트리밍

## Architecture

이번 구현은 headless class와 pure state reducer를 분리한다.

`src/shared/lib/audio`는 브라우저 API 접근을 담당한다. 이 레이어는 `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, `Blob`을 직접 다루며, 호출자에게는 안정적인 `CapturedAudio` 값을 반환한다.

`src/shared/model/recording`은 UI와 브라우저 API를 모르는 순수 상태 모델이다. 녹음 버튼, 재시도 버튼, 에러 표시 UI는 이 모델의 상태를 기반으로 렌더링할 수 있다.

의존 방향은 다음과 같다.

```text
shared/model/recording  <- no browser dependency
shared/lib/audio        <- browser MediaRecorder dependency
features/views          <- UI integration in #32
```

## Public Types

`CapturedAudio`는 이후 #7 `STTProvider`가 받을 수 있는 최소 단위다.

```typescript
export interface CapturedAudio {
  blob: Blob;
  mimeType: SupportedAudioMimeType;
  extension: SupportedAudioExtension;
  durationMs: number;
}
```

지원 포맷은 런타임에서 `MediaRecorder.isTypeSupported`로 선택한다.

우선순위:

1. `audio/webm;codecs=opus` -> `webm`
2. `audio/webm` -> `webm`
3. `audio/mp4` -> `mp4`
4. `audio/aac` -> `aac`

선택 가능한 포맷이 없으면 recorder를 시작하지 않고 `unsupported-format` 오류를 반환한다.

## Recording State Model

상태는 다음 union으로 둔다.

```typescript
type RecordingState =
  | { status: "idle" }
  | { status: "permissionRequesting" }
  | { status: "recording"; startedAtMs: number }
  | { status: "recorded"; audio: CapturedAudio }
  | { status: "failed"; error: RecordingError };
```

상태 전이는 reducer로 표현한다.

```text
idle -> permissionRequesting
permissionRequesting -> recording
permissionRequesting -> failed
recording -> recorded
recording -> idle
recorded -> idle
failed -> idle
```

`cancel`과 0.8초 미만 녹음은 모두 `idle`로 돌아간다. 0.8초 미만 녹음은 `CapturedAudio`를 만들지 않는다.

## Audio Capture Contract

오디오 캡처 유틸은 다음 책임을 가진다.

- `start()`: 권한 요청 후 recorder 시작
- `stop()`: 녹음을 종료하고 최소 길이를 만족하면 `CapturedAudio` 반환
- `cancel()`: 현재 recorder와 stream track을 정리하고 결과를 버림
- `retry()`: recorded 상태 이후 다시 idle로 전환할 수 있도록 상태 모델에서 처리

`stop()`은 recorder의 `dataavailable` 이벤트 chunk를 모아 하나의 `Blob`으로 만든다.

stream track은 `stop()`과 `cancel()` 모두에서 반드시 정리한다.

## Errors

UI는 `RecordingErrorCode`만 보고 사용자 메시지를 결정할 수 있어야 한다.

```typescript
type RecordingErrorCode =
  | "permission-denied"
  | "device-not-found"
  | "unsupported-format"
  | "recorder-unavailable"
  | "recorder-failed";
```

브라우저 원본 오류 객체는 디버깅용 `cause`로 보존한다.

## Testing

테스트는 실제 마이크를 사용하지 않는다.

필수 테스트:

- 지원 포맷 선택 우선순위
- 지원 포맷이 없을 때 `null` 반환
- 상태 reducer의 정상 전이
- 상태 reducer의 잘못된 전이 방어
- 0.8초 미만 녹음 discard
- 권한 오류 매핑
- 장치 없음 오류 매핑
- recorder 이벤트 기반 capture 결과 조립
- `stop()`과 `cancel()`에서 stream track cleanup 수행

브라우저 호환성은 `MediaRecorder.isTypeSupported` 분기 테스트로 검증한다. 실제 Chrome, Firefox, iOS Safari 기기 검증은 UI 연결 이후 수동 QA 항목으로 남긴다.

## Open Questions

- iOS Safari의 `audio/mp4` 또는 `audio/aac` 결과가 OpenAI STT에 그대로 전달 가능한지는 #7 STTProvider 구현 시 실제 API 호출로 검증한다.
- UI에서 녹음 중 elapsed time을 표시할지는 #32 Session UI에서 결정한다. 이번 모듈은 `startedAtMs`와 최종 `durationMs`만 제공한다.

## Verification

Required checks:

- `npm test -- --runInBand`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
