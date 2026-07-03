# Evaluation Provider And Analysis Result Schema Design

## Goal

Implement issue #8 by introducing a server-side evaluation capability that hides OpenAI responses behind provider interfaces and returns a normalized, versioned analysis result schema for result renderers.

The UI must never parse raw OpenAI responses. Roleplay and memorization result rendering should consume the same `EvaluationResultV1` contract.

## Scope

Included:

- `EvaluationResultV1` schema and TypeScript types.
- `EvaluationMode = "exact" | "context"`.
- Practice/mode support policy.
- `DiffProvider` interface.
- `EvaluationProvider` interface.
- `EvaluationProviderRegistry` selector.
- `EvaluationResultService` orchestration.
- OpenAI-backed evaluation providers.
- Exact deterministic diff provider.
- OpenAI semantic diff provider for context mode.
- Schema validation and normalization.

Excluded:

- Analysis processor wiring from issue #11.
- Supabase writes or migration changes.
- Result renderer UI from issue #33.
- User-facing controls for `memorization + context`.

## Domain Model

```text
'Transcript produced'
  -> command: Evaluate transcript against expected snapshot
  -> event: 'Evaluation result produced'

'Evaluation result produced'
  -> command: Normalize result schema
  -> event: 'Analysis result ready for rendering'
```

### Practice Type And Mode

`practiceType` describes what kind of practice produced the target.

```ts
type EvaluationPracticeType = "roleplay" | "memorization";
```

`mode` describes the evaluation policy.

```ts
type EvaluationMode = "exact" | "context";
```

Supported combinations for this issue:

| Practice type  | Mode      | Status                | Meaning                                                             |
| -------------- | --------- | --------------------- | ------------------------------------------------------------------- |
| `roleplay`     | `exact`   | supported             | Compare against expected line text.                                 |
| `roleplay`     | `context` | supported             | Evaluate whether the learner preserved the situation and intent.    |
| `memorization` | `exact`   | supported             | Compare against expected sentence text.                             |
| `memorization` | `context` | unsupported for users | Type-compatible for future expansion, blocked at provider registry. |

Unsupported combinations throw `UnsupportedEvaluationModeError` at the server boundary.

## Result Contract

```ts
type EvaluationDiffOperation = "equal" | "insert" | "delete" | "replace";

type EvaluationDiffSegment = {
  op: EvaluationDiffOperation;
  expected?: string;
  actual?: string;
};

type EvaluationResultV1 = {
  schema_version: "v1";
  transcript: string;
  diff: EvaluationDiffSegment[];
  feedback: string;
  score?: number;
};
```

`diff` is phrase-like segment data inside one evaluated target. Target identity is not part of the result schema because the existing analysis result row already owns the practice target.

Schema migration strategy:

- `EvaluationResultV1` is append-only.
- New render-breaking shapes become `EvaluationResultV2`.
- Storage and UI should branch on `schema_version`.
- Provider raw responses are never persisted as the renderer contract.

## Architecture

Use `Strategy + Registry + Application Service`.

```text
EvaluationResultService
  -> EvaluationProviderRegistry
       -> DiffProvider
       -> EvaluationProvider
  -> EvaluationResultV1
```

### Interfaces

```ts
interface DiffProvider {
  createDiff(input: DiffProviderInput): Promise<EvaluationDiffSegment[]>;
}

interface EvaluationProvider {
  evaluate(input: EvaluationProviderInput): Promise<EvaluationFeedbackResult>;
}

interface EvaluationProviderRegistry {
  resolve(key: EvaluationProviderKey): EvaluationProviderEntry;
}
```

`EvaluationResultService` receives only the registry. It does not know OpenAI classes or mode-specific provider classes.

```ts
class EvaluationResultService {
  constructor(private readonly registry: EvaluationProviderRegistry) {}

  async evaluate(input: EvaluationRequest): Promise<EvaluationResultV1> {
    const { diffProvider, evaluationProvider } = this.registry.resolve(input);

    const [diff, evaluation] = await Promise.all([
      diffProvider.createDiff(input),
      evaluationProvider.evaluate(input),
    ]);

    return {
      schema_version: "v1",
      transcript: input.transcript,
      diff,
      feedback: evaluation.feedback,
      score: evaluation.score,
    };
  }
}
```

### Mode Policies

```text
roleplay + exact
  DiffProvider: ExactDiffProvider
  EvaluationProvider: OpenAIRoleplayExactEvaluationProvider

roleplay + context
  DiffProvider: OpenAIContextDiffProvider
  EvaluationProvider: OpenAIRoleplayContextEvaluationProvider

memorization + exact
  DiffProvider: ExactDiffProvider
  EvaluationProvider: OpenAIMemorizationExactEvaluationProvider

memorization + context
  UnsupportedEvaluationModeError
```

## OpenAI Boundary

OpenAI implementation lives under a server-only module. OpenAI structured output is used for provider JSON responses so the provider can validate and normalize output before returning domain-facing types.

The OpenAI client is created by `shared/lib/openai/server.ts`. This issue should add an evaluation model getter such as `getOpenAIEvaluationModel()` with a default model and an `OPENAI_EVALUATION_MODEL` override.

OpenAI providers return only parsed types:

- semantic diff provider returns `EvaluationDiffSegment[]`.
- evaluation provider returns `{ feedback, score? }`.

## FSD Placement

```text
src/shared/lib/evaluation/
  errors.ts
  index.ts
  schema.ts
  types.ts
  validation.ts
  server/
    EvaluationResultService.ts
    ExactDiffProvider.ts
    OpenAIContextDiffProvider.ts
    OpenAIEvaluationProviders.ts
    StaticEvaluationProviderRegistry.ts
    factory.ts
    index.ts
```

Rationale:

- Evaluation is a shared server capability consumed later by the analysis processor.
- It is not owned by a UI feature.
- It is analogous to `shared/lib/stt`.
- Server-only OpenAI imports stay below `server/`.

## Error Handling

Expected custom errors:

- `UnsupportedEvaluationModeError`: unsupported practice/mode combination.
- `EvaluationProviderFailedError`: OpenAI call or unknown provider failure.
- `EvaluationProviderInvalidResponseError`: structured output or schema validation failure.

Error codes should follow the global `DOMAIN-001` format, using the `EVAL-###` namespace.

## Testing

Unit tests should cover:

- `EvaluationResultV1` schema accepts valid normalized output.
- schema rejects malformed diff/feedback output.
- support policy rejects `memorization + context`.
- exact diff provider produces stable phrase-like segments.
- registry resolves supported combinations and rejects unsupported ones.
- service composes diff and feedback into `EvaluationResultV1`.
- OpenAI providers parse structured output and do not expose raw responses.

## Acceptance Criteria Mapping

- provider interface exists: `EvaluationProvider` and `DiffProvider`.
- OpenAI response goes through schema validation: zod schemas and provider tests.
- roleplay exact/context prompts are separated: separate provider classes or prompt builders.
- memorization diff/feedback prompt exists: memorization exact provider.
- UI does not parse raw OpenAI response: only `EvaluationResultV1` leaves the service.
- migration strategy is documented: `schema_version` section above.
