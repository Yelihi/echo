/** @jest-environment node */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createSupabaseServerClient } from "../server";

jest.mock("server-only", () => ({}));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@supabase/ssr", () => ({ createServerClient: jest.fn() }));

const originalEnv = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...originalEnv };
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

afterEach(() => {
  process.env = originalEnv;
});

test("allows Next.js to stop prerendering at the request boundary without Supabase config", async () => {
  const requestBoundary = new Error("request cookies are unavailable during prerendering");
  jest.mocked(cookies).mockRejectedValue(requestBoundary);

  await expect(createSupabaseServerClient()).rejects.toBe(requestBoundary);
  expect(createServerClient).not.toHaveBeenCalled();
});

test("still rejects missing Supabase config once request cookies are available", async () => {
  jest
    .mocked(cookies)
    .mockResolvedValue(new Map() as unknown as Awaited<ReturnType<typeof cookies>>);

  await expect(createSupabaseServerClient()).rejects.toThrow(
    "Missing Supabase environment variables",
  );
  expect(createServerClient).not.toHaveBeenCalled();
});
