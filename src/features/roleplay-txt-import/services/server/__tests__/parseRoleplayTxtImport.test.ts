import { describe, expect, it, jest } from "@jest/globals";

import {
  RoleplayTxtImportEmptyTextError,
  RoleplayTxtImportInvalidOutputError,
  RoleplayTxtImportProviderFailedError,
  RoleplayTxtImportTooManySpeakersError,
  RoleplayTxtImportUnsupportedFileError,
} from "@/features/roleplay-txt-import/models/errors";
import {
  parseRoleplayTxtImport,
  type RoleplayTxtImportOpenAIClient,
} from "@/features/roleplay-txt-import/services/server/parseRoleplayTxtImport";

jest.mock("server-only", () => ({}));

describe("parseRoleplayTxtImport", () => {
  it("should reject non txt files before calling OpenAI", async () => {
    // Given
    const parse = jest.fn();

    // When & Then
    await expect(
      parseRoleplayTxtImport({
        file: createFile("script.pdf", "application/pdf", "A: Hello"),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(RoleplayTxtImportUnsupportedFileError);
    expect(parse).not.toHaveBeenCalled();
  });

  it("should reject empty txt files before calling OpenAI", async () => {
    // Given
    const parse = jest.fn();

    // When & Then
    await expect(
      parseRoleplayTxtImport({
        file: createFile("script.txt", "text/plain", "   "),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(RoleplayTxtImportEmptyTextError);
    expect(parse).not.toHaveBeenCalled();
  });

  it("should parse a valid two speaker txt import draft", async () => {
    // Given
    const parse = jest.fn(async () => ({
      output_parsed: {
        speakers: [
          { sourceName: "Customer", role: "me", displayName: "Customer" },
          { sourceName: "Clerk", role: "partner", displayName: "Clerk" },
        ],
        lines: [
          { speaker: "Clerk", text: "Good morning. How can I help you?", translation: null },
          { speaker: "Customer", text: "I would like a window seat.", translation: null },
        ],
      },
    }));

    // When
    const draft = await parseRoleplayTxtImport({
      file: createFile(
        "airport.txt",
        "text/plain",
        "Clerk: Good morning. How can I help you?\nCustomer: I would like a window seat.",
      ),
      client: createClient(parse),
      model: "test-model",
    });

    // Then
    expect(draft).toEqual({
      speakers: [
        { id: "partner", displayName: "Clerk" },
        { id: "me", displayName: "Customer" },
      ],
      lines: [
        {
          speakerId: "partner",
          text: "Good morning. How can I help you?",
          translation: null,
        },
        {
          speakerId: "me",
          text: "I would like a window seat.",
          translation: null,
        },
      ],
    });
    expect(parse).toHaveBeenCalledWith(expect.objectContaining({ model: "test-model" }));
  });

  it("should reject parsed output with more than two speakers", async () => {
    // Given
    const parse = jest.fn(async () => ({
      output_parsed: {
        speakers: [
          { sourceName: "A", role: "partner", displayName: "A" },
          { sourceName: "B", role: "me", displayName: "B" },
          { sourceName: "C", role: "partner", displayName: "C" },
        ],
        lines: [
          { speaker: "A", text: "Hello.", translation: null },
          { speaker: "B", text: "Hi.", translation: null },
          { speaker: "C", text: "Wait.", translation: null },
        ],
      },
    }));

    // When & Then
    await expect(
      parseRoleplayTxtImport({
        file: createFile("script.txt", "text/plain", "A: Hello.\nB: Hi.\nC: Wait."),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(RoleplayTxtImportTooManySpeakersError);
  });

  it("should map invalid OpenAI output to an import error", async () => {
    // Given
    const parse = jest.fn(async () => ({
      output_parsed: {
        speakers: [{ sourceName: "A", role: "partner", displayName: "A" }],
        lines: [{ speaker: "Unknown", text: "Hello.", translation: null }],
      },
    }));

    // When & Then
    await expect(
      parseRoleplayTxtImport({
        file: createFile("script.txt", "text/plain", "A: Hello."),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(RoleplayTxtImportInvalidOutputError);
  });

  it("should map OpenAI request failures to a provider error", async () => {
    // Given
    const parse = jest.fn(async () => {
      throw new Error("network unavailable");
    });

    // When & Then
    await expect(
      parseRoleplayTxtImport({
        file: createFile("script.txt", "text/plain", "A: Hello.\nB: Hi."),
        client: createClient(parse),
        model: "test-model",
      }),
    ).rejects.toBeInstanceOf(RoleplayTxtImportProviderFailedError);
  });
});

function createFile(name: string, type: string, text: string): File {
  return {
    name,
    type,
    text: async () => text,
  } as unknown as File;
}

function createClient(parse: jest.Mock): RoleplayTxtImportOpenAIClient {
  return {
    responses: {
      parse: parse as RoleplayTxtImportOpenAIClient["responses"]["parse"],
    },
  };
}
