import { createExactDiff } from "./exactDiff.ts";
import type { AcceptedRecording, Evaluation, PracticeType } from "./types.ts";

export async function transcribe(audio: Blob, recording: AcceptedRecording): Promise<string> {
  const body = new FormData();
  body.append("model", Deno.env.get("OPENAI_STT_MODEL")?.trim() || "gpt-4o-mini-transcribe");
  body.append("response_format", "json");
  body.append("file", audio, filenameFromPath(recording.object_path));

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${getOpenAIKey()}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`OpenAI STT failed: ${await response.text()}`);
  }

  const result = (await response.json()) as { text?: string };
  const text = result.text?.trim();

  if (!text) {
    throw new Error("OpenAI STT returned an empty transcript.");
  }

  return text;
}

export async function evaluate(input: {
  expectedText: string;
  transcript: string;
  practiceType: PracticeType;
}): Promise<Evaluation> {
  // The Edge Function uses REST instead of the OpenAI SDK, so we send the JSON Schema
  // directly and still validate locally before persisting the result.
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${getOpenAIKey()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(buildEvaluationRequestBody(input)),
  });

  if (!response.ok) {
    throw new Error(`OpenAI evaluation failed: ${await response.text()}`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI evaluation returned an empty response.");
  }

  const parsed = parseEvaluationContent(content);

  return {
    feedback: parsed.feedback,
    score: parsed.score,
    diff: createExactDiff(input.expectedText, input.transcript),
  };
}

function buildEvaluationRequestBody(input: {
  expectedText: string;
  transcript: string;
  practiceType: PracticeType;
}) {
  return {
    model: Deno.env.get("OPENAI_EVALUATION_MODEL")?.trim() || "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content:
          "Evaluate English speaking practice. Return JSON only with feedback string and score number from 0 to 100.",
      },
      {
        role: "user",
        content: [
          `Practice type: ${input.practiceType}`,
          "Evaluation mode: exact",
          `Expected: ${input.expectedText}`,
          `Transcript: ${input.transcript}`,
        ].join("\n"),
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "evaluation_feedback",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["feedback", "score"],
          properties: {
            feedback: { type: "string" },
            score: {
              type: ["number", "null"],
              minimum: 0,
              maximum: 100,
            },
          },
        },
      },
    },
  };
}

function parseEvaluationContent(content: string): { feedback: string; score: number | null } {
  const parsed = JSON.parse(content) as { feedback?: unknown; score?: unknown };

  if (typeof parsed.feedback !== "string") {
    throw new Error("OpenAI evaluation returned invalid feedback.");
  }

  const feedback = parsed.feedback?.trim();

  if (!feedback) {
    throw new Error("OpenAI evaluation returned invalid feedback.");
  }

  if (parsed.score !== null && typeof parsed.score !== "number") {
    throw new Error("OpenAI evaluation returned invalid score.");
  }

  if (typeof parsed.score === "number" && (parsed.score < 0 || parsed.score > 100)) {
    throw new Error("OpenAI evaluation returned out-of-range score.");
  }

  return {
    feedback,
    score: parsed.score,
  };
}

function getOpenAIKey(): string {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  return apiKey;
}

function filenameFromPath(path: string): string {
  return path.split("/").at(-1) || "recording.webm";
}
