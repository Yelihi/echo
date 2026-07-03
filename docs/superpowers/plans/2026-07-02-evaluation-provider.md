# Evaluation Provider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a server-side evaluation provider layer that produces validated `EvaluationResultV1` values for analysis result renderers.

**Architecture:** Use `Strategy + Registry + Application Service`. `EvaluationResultService` resolves a `DiffProvider` and an `EvaluationProvider` from a registry, runs both, and returns the versioned result contract. OpenAI implementations live under a server-only entry and return only parsed zod-validated values.

**Tech Stack:** Next.js App Router, TypeScript, Jest, Zod, OpenAI Node SDK Responses API.

---

## File Structure

- Create `src/shared/lib/evaluation/types.ts`: shared provider/result interfaces and request types.
- Create `src/shared/lib/evaluation/schema.ts`: zod schemas for `EvaluationResultV1`, diff output, and feedback output.
- Create `src/shared/lib/evaluation/validation.ts`: support policy for `practiceType + mode`.
- Create `src/shared/lib/evaluation/errors.ts`: `CustomError` subclasses for unsupported mode, provider failure, and invalid response.
- Create `src/shared/lib/evaluation/index.ts`: public non-server exports.
- Create `src/shared/lib/evaluation/server/ExactDiffProvider.ts`: deterministic phrase-like diff provider.
- Create `src/shared/lib/evaluation/server/OpenAIContextDiffProvider.ts`: OpenAI semantic diff provider.
- Create `src/shared/lib/evaluation/server/OpenAIEvaluationProviders.ts`: roleplay/memorization feedback providers.
- Create `src/shared/lib/evaluation/server/StaticEvaluationProviderRegistry.ts`: registry implementation.
- Create `src/shared/lib/evaluation/server/EvaluationResultService.ts`: orchestration service.
- Create `src/shared/lib/evaluation/server/factory.ts`: server wiring using the OpenAI client.
- Create `src/shared/lib/evaluation/server/index.ts`: server public exports.
- Modify `src/shared/lib/openai/server.ts`: add evaluation model getter.

## Task 1: Contract, Schemas, Support Policy, And Errors

**Files:**

- Create: `src/shared/lib/evaluation/types.ts`
- Create: `src/shared/lib/evaluation/schema.ts`
- Create: `src/shared/lib/evaluation/validation.ts`
- Create: `src/shared/lib/evaluation/errors.ts`
- Create: `src/shared/lib/evaluation/index.ts`
- Test: `src/shared/lib/evaluation/__tests__/schema.test.ts`
- Test: `src/shared/lib/evaluation/__tests__/validation.test.ts`

- [ ] **Step 1: Write failing schema and validation tests**

```ts
import { describe, expect, it } from "@jest/globals";

import { evaluationResultV1Schema } from "@/shared/lib/evaluation/schema";

describe("evaluationResultV1Schema", () => {
  it("accepts a normalized v1 evaluation result", () => {
    const result = evaluationResultV1Schema.parse({
      schema_version: "v1",
      transcript: "I want a window seat.",
      diff: [
        { op: "equal", expected: "I", actual: "I" },
        { op: "replace", expected: "would like", actual: "want" },
        { op: "equal", expected: "a window seat.", actual: "a window seat." },
      ],
      feedback: "Good meaning, but use the more polite phrase from the script.",
      score: 82,
    });

    expect(result.schema_version).toBe("v1");
    expect(result.diff).toHaveLength(3);
  });

  it("rejects a diff segment without any expected or actual text", () => {
    expect(() =>
      evaluationResultV1Schema.parse({
        schema_version: "v1",
        transcript: "I want a window seat.",
        diff: [{ op: "replace" }],
        feedback: "Missing segment text.",
      }),
    ).toThrow();
  });
});
```

```ts
import { describe, expect, it } from "@jest/globals";

import { UnsupportedEvaluationModeError } from "@/shared/lib/evaluation/errors";
import { assertSupportedEvaluationRequest } from "@/shared/lib/evaluation/validation";

describe("assertSupportedEvaluationRequest", () => {
  it("allows roleplay exact, roleplay context, and memorization exact", () => {
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "roleplay", mode: "exact" }),
    ).not.toThrow();
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "roleplay", mode: "context" }),
    ).not.toThrow();
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "memorization", mode: "exact" }),
    ).not.toThrow();
  });

  it("rejects memorization context until it is exposed to users", () => {
    expect(() =>
      assertSupportedEvaluationRequest({ practiceType: "memorization", mode: "context" }),
    ).toThrow(UnsupportedEvaluationModeError);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/__tests__/schema.test.ts src/shared/lib/evaluation/__tests__/validation.test.ts
```

Expected: FAIL because evaluation modules do not exist.

- [ ] **Step 3: Implement minimal contract modules**

Add `types.ts`:

```ts
export type EvaluationPracticeType = "roleplay" | "memorization";
export type EvaluationMode = "exact" | "context";
export type EvaluationProviderName = "openai";
export type EvaluationResultSchemaVersion = "v1";
export type EvaluationDiffOperation = "equal" | "insert" | "delete" | "replace";

export interface EvaluationDiffSegment {
  readonly op: EvaluationDiffOperation;
  readonly expected?: string;
  readonly actual?: string;
}

export interface EvaluationResultV1 {
  readonly schema_version: "v1";
  readonly transcript: string;
  readonly diff: ReadonlyArray<EvaluationDiffSegment>;
  readonly feedback: string;
  readonly score?: number;
}

export interface EvaluationExpectedSnapshot {
  readonly text: string;
  readonly context?: string;
}

export interface EvaluationRequest {
  readonly practiceType: EvaluationPracticeType;
  readonly mode: EvaluationMode;
  readonly expected: EvaluationExpectedSnapshot;
  readonly transcript: string;
}

export interface DiffProviderInput extends EvaluationRequest {}
export interface EvaluationProviderInput extends EvaluationRequest {}

export interface EvaluationFeedbackResult {
  readonly provider: EvaluationProviderName;
  readonly model: string;
  readonly feedback: string;
  readonly score?: number;
}

export interface DiffProvider {
  createDiff(input: DiffProviderInput): Promise<ReadonlyArray<EvaluationDiffSegment>>;
}

export interface EvaluationProvider {
  evaluate(input: EvaluationProviderInput): Promise<EvaluationFeedbackResult>;
}

export type EvaluationProviderKey = Pick<EvaluationRequest, "practiceType" | "mode">;

export interface EvaluationProviderEntry {
  readonly diffProvider: DiffProvider;
  readonly evaluationProvider: EvaluationProvider;
}

export interface EvaluationProviderRegistry {
  resolve(key: EvaluationProviderKey): EvaluationProviderEntry;
}
```

Add `schema.ts`, `validation.ts`, `errors.ts`, and `index.ts` with matching exports.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/__tests__/schema.test.ts src/shared/lib/evaluation/__tests__/validation.test.ts
```

Expected: PASS.

## Task 2: Exact Diff Provider

**Files:**

- Create: `src/shared/lib/evaluation/server/ExactDiffProvider.ts`
- Test: `src/shared/lib/evaluation/server/__tests__/ExactDiffProvider.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "@jest/globals";

import { ExactDiffProvider } from "@/shared/lib/evaluation/server/ExactDiffProvider";

describe("ExactDiffProvider", () => {
  it("creates stable phrase-like replacement segments", async () => {
    const provider = new ExactDiffProvider();

    const diff = await provider.createDiff({
      practiceType: "roleplay",
      mode: "exact",
      expected: { text: "I would like a window seat." },
      transcript: "I want a window seat.",
    });

    expect(diff).toEqual([
      { op: "equal", expected: "I", actual: "I" },
      { op: "replace", expected: "would like", actual: "want" },
      { op: "equal", expected: "a window seat.", actual: "a window seat." },
    ]);
  });

  it("marks inserted and deleted text", async () => {
    const provider = new ExactDiffProvider();

    await expect(
      provider.createDiff({
        practiceType: "memorization",
        mode: "exact",
        expected: { text: "Practice every day." },
        transcript: "Practice.",
      }),
    ).resolves.toEqual([
      { op: "equal", expected: "Practice.", actual: "Practice." },
      { op: "delete", expected: "every day." },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/ExactDiffProvider.test.ts
```

Expected: FAIL because `ExactDiffProvider` does not exist.

- [ ] **Step 3: Implement minimal provider**

Use a small token-based LCS diff. Merge adjacent non-equal delete/insert pairs into `replace`.

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/ExactDiffProvider.test.ts
```

Expected: PASS.

## Task 3: Registry And Result Service

**Files:**

- Create: `src/shared/lib/evaluation/server/StaticEvaluationProviderRegistry.ts`
- Create: `src/shared/lib/evaluation/server/EvaluationResultService.ts`
- Create: `src/shared/lib/evaluation/server/index.ts`
- Test: `src/shared/lib/evaluation/server/__tests__/StaticEvaluationProviderRegistry.test.ts`
- Test: `src/shared/lib/evaluation/server/__tests__/EvaluationResultService.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should verify:

- registry resolves `roleplay:exact`.
- registry rejects `memorization:context` with `UnsupportedEvaluationModeError`.
- service composes diff provider output and evaluation provider output into `EvaluationResultV1`.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/StaticEvaluationProviderRegistry.test.ts src/shared/lib/evaluation/server/__tests__/EvaluationResultService.test.ts
```

Expected: FAIL because registry and service do not exist.

- [ ] **Step 3: Implement registry and service**

Registry key format is `${practiceType}:${mode}`. Service calls `registry.resolve(input)`, runs providers in parallel, and parses the assembled result with `evaluationResultV1Schema`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/StaticEvaluationProviderRegistry.test.ts src/shared/lib/evaluation/server/__tests__/EvaluationResultService.test.ts
```

Expected: PASS.

## Task 4: OpenAI Providers And Factory

**Files:**

- Create: `src/shared/lib/evaluation/server/OpenAIContextDiffProvider.ts`
- Create: `src/shared/lib/evaluation/server/OpenAIEvaluationProviders.ts`
- Create: `src/shared/lib/evaluation/server/factory.ts`
- Modify: `src/shared/lib/openai/server.ts`
- Test: `src/shared/lib/evaluation/server/__tests__/OpenAIProviders.test.ts`
- Test: `src/shared/lib/evaluation/server/__tests__/factory.test.ts`

- [ ] **Step 1: Write failing tests**

Tests should use a fake OpenAI client with `responses.parse`.

- `OpenAIContextDiffProvider` returns parsed semantic diff output.
- roleplay exact/context and memorization exact providers return parsed feedback output.
- provider throws `EvaluationProviderInvalidResponseError` when parsed output is `null`.
- factory wires exactly the supported combinations and rejects `memorization:context`.

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/OpenAIProviders.test.ts src/shared/lib/evaluation/server/__tests__/factory.test.ts
```

Expected: FAIL because OpenAI provider modules do not exist.

- [ ] **Step 3: Implement OpenAI providers and factory**

Use `server-only`, `zodTextFormat`, and `client.responses.parse`.

`src/shared/lib/openai/server.ts` adds:

```ts
export const DEFAULT_OPENAI_EVALUATION_MODEL = "gpt-5.4-mini" as const;

export function getOpenAIEvaluationModel(): string {
  return process.env.OPENAI_EVALUATION_MODEL?.trim() || DEFAULT_OPENAI_EVALUATION_MODEL;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- --runTestsByPath src/shared/lib/evaluation/server/__tests__/OpenAIProviders.test.ts src/shared/lib/evaluation/server/__tests__/factory.test.ts
```

Expected: PASS.

## Task 5: Final Verification

**Files:**

- No new implementation files.

- [ ] **Step 1: Run focused evaluation tests**

```bash
npm test -- src/shared/lib/evaluation
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 4: Run lint**

```bash
npm run lint
```

Expected: PASS.
