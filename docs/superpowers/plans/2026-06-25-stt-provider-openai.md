# STTProvider OpenAI Plan

## Scope

Implement GitHub issue #7 after design agreement.

In scope:

- `STTProvider` interface.
- Normalized transcript DTO.
- Normalized provider error with retryability.
- OpenAI-backed provider implementation.
- Defensive audio format validation.
- Server-only guard.
- Unit tests.

Out of scope:

- Supabase Storage download from #12.
- Analysis processor from #11.
- UI changes.
- Reworking browser audio capture from #5, except documenting that `aac` must not enter STT normal flow.

## Implementation Steps

1. Add failing Jest tests for provider contract, success normalization, unsupported format short-circuit, and error mapping.
2. Add `src/shared/lib/stt` contract/error/validation modules.
3. Add `src/shared/lib/stt/server/OpenAISTTProvider.ts` with `server-only` and OpenAI SDK usage.
4. Add `getOpenAISTTModel()` with default `gpt-4o-mini-transcribe` and optional `OPENAI_STT_MODEL`.
5. Add `.env.example` note for optional `OPENAI_STT_MODEL`.
6. Run targeted tests.
7. Run full test/typecheck/lint.
8. Review acceptance criteria from issue #7.

## Verification

- `npm test -- src/shared/lib/stt`
- `npm test`
- `npm run typecheck`
- `npm run lint`

If local `npm` is unavailable in the Codex shell, use the bundled Node runtime with local binaries and report that explicitly.
