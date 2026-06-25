# STTProvider OpenAI Design

## Goal

Implement a replaceable server-side STT provider contract for converting an accepted recording file into a normalized transcript.

## Agreed Decisions

- Provider input is an already downloaded file object or bytes, not a Supabase Storage path.
- `STTProvider` does not know Supabase Storage. The future analysis processor or storage adapter owns download/signed URL handling.
- Default OpenAI model is `gpt-4o-mini-transcribe`.
- `OPENAI_STT_MODEL` may override the default model for production experiments.
- `aac` should be blocked before the STT provider in the recording/upload/analysis preparation path.
- The provider still defensively rejects unsupported formats as a contract violation.

## DDD

### Event Storming

```text
'Recording finalized'
  -> command: Transcribe recording
  -> workflow: STT provider processes audio
  -> event: 'Transcript produced'

'STT failed'
  -> command: Mark analysis item failed
  -> event: 'Transcript unavailable'
```

### Bounded Contexts

- Analysis context consumes transcripts.
- Provider context hides OpenAI details.
- Storage context resolves private recordings into downloadable file input.
- UI context does not call STT directly.

### Domain Contract

```text
data STTProviderInput =
  audio file or bytes
  AND filename
  AND mime type

data Transcript =
  provider
  AND model
  AND text

data STTProviderError =
  unsupported audio format
  OR empty transcript
  OR provider failure with retryability
```

Rules:

- Transcript text is trimmed before leaving the provider.
- Blank transcript is non-retryable.
- Unsupported audio format is non-retryable.
- Rate limit and provider unavailable failures are retryable.
- Auth, bad request, and invalid format failures are non-retryable.

## Model Cost Decision

OpenAI pricing checked on 2026-06-25 from the official pricing page.

| Model                    | Input / 1M tokens | Output / 1M tokens | Estimated cost / min | 1 hour | 100 hours | Decision                |
| ------------------------ | ----------------: | -----------------: | -------------------: | -----: | --------: | ----------------------- |
| `gpt-4o-mini-transcribe` |             $1.25 |              $5.00 |               $0.003 |  $0.18 |       $18 | MVP default             |
| `gpt-4o-transcribe`      |             $2.50 |             $10.00 |               $0.006 |  $0.36 |       $36 | Accuracy upgrade option |

Rationale:

- MVP expects repeated short recordings, so per-minute cost matters.
- `gpt-4o-mini-transcribe` is half the estimated per-minute cost of `gpt-4o-transcribe`.
- Keeping `OPENAI_STT_MODEL` allows switching to `gpt-4o-transcribe` if real sample accuracy requires it.

Reference: https://developers.openai.com/api/docs/pricing

## Audio Format Boundary

Normal flow:

```text
AudioCapture
  -> captured audio metadata
  -> upload / analysis preparation validates STT-compatible format
  -> unsupported format such as aac is stopped before STTProvider
  -> STTProvider receives only provider-compatible audio
```

Provider defensive validation:

- Accept OpenAI transcription-compatible file extensions such as `webm`, `mp4`, `m4a`, `wav`, `mp3`, `flac`, `ogg`, `mpeg`, `mpga`.
- Reject unsupported input with `unsupported-audio-format`, `retryable: false`.

## Architecture

### Boundary Map

```text
STT provider
  server: OpenAI implementation, OpenAI SDK import, server-only guard
  shared contract: provider interface, transcript DTO, normalized error type
  client: none
  state: none
```

### FSD Placement

```text
src/shared/lib/stt/
  types.ts
  errors.ts
  validation.ts
  index.ts
  server/
    OpenAISTTProvider.ts
    index.ts
```

Rationale:

- `shared/lib/stt` is a reusable technical capability.
- Server implementation is split under a server entry so client code can import contract/error types without pulling OpenAI or `server-only`.
- Analysis processor can later depend on `STTProvider`, not on OpenAI.

## Feature Checklist

### Requirements

- `STTProvider` interface exists.
- OpenAI implementation sits behind the interface.
- UI/page components do not import OpenAI SDK.
- Provider errors expose stable codes and `retryable`.
- Contract can be implemented by a future worker provider.

### Domain & Types

- Provider input uses file/bytes, filename, and mime type.
- Transcript DTO exposes provider, model, and text only.
- Error code is a finite union.
- OpenAI response objects do not cross the provider boundary.

### Server / Client Boundary

- OpenAI implementation imports `server-only`.
- OpenAI SDK is imported only from server implementation/shared server client.
- Shared contract modules avoid server-only imports.

### State / UI / A11y

- N/A. This feature adds no route, component, browser state, or interaction.

### Edge Cases & Errors

- Unsupported format fails before OpenAI call.
- Empty transcript is non-retryable.
- Rate limit/provider unavailable is retryable.
- Auth/bad request is non-retryable.
- Unknown provider failure is retryable by default.

### Testing

- Unit test format compatibility guard.
- Unit test OpenAI success response normalization.
- Unit test unsupported format short-circuit.
- Unit test retryable and non-retryable provider error mapping.

## Done Criteria

- Design decisions above are implemented without adding UI coupling.
- `aac` normal flow is stopped before provider; provider keeps defensive rejection.
- `npm test -- src/shared/lib/stt` passes.
- `npm run typecheck` passes.
- `npm run lint` passes.
