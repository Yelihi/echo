/** @jest-environment node */
import { beforeEach, expect, it, jest } from "@jest/globals";

jest.mock("@/shared/lib/supabase/server", () => ({ createSupabaseServerClient: jest.fn() }));
const exchange = jest.fn<() => Promise<{ error: Error | null }>>();
beforeEach(async () => {
  const { createSupabaseServerClient } = await import("@/shared/lib/supabase/server");
  exchange.mockReset().mockResolvedValue({ error: null });
  jest.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { exchangeCodeForSession: exchange },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
});

it.each([
  ["/sessions?page=2#recent", "/sessions?page=2#recent"],
  ["@outside.example/", "/home"],
  ["https://outside.example/", "/home"],
  ["//outside.example/", "/home"],
  ["/\\outside.example/", "/home"],
  ["/\n/outside.example/", "/home"],
  ["", "/home"],
])("keeps callback destination on the application origin: %j", async (next, path) => {
  const { GET } = await import("../route");
  const url = new URL("https://echo.example/api/auth/callback?code=test");
  url.searchParams.set("next", next);
  const response = await GET(new Request(url));
  expect(response.headers.get("location")).toBe(`https://echo.example${path}`);
});

it("returns to login if code exchange fails or the code is absent", async () => {
  const { GET } = await import("../route");
  exchange.mockResolvedValue({ error: new Error("expired") });
  for (const query of ["?code=expired", ""]) {
    const response = await GET(new Request(`https://echo.example/api/auth/callback${query}`));
    expect(response.headers.get("location")).toBe("https://echo.example/login");
  }
  expect(exchange).toHaveBeenCalledTimes(1);
});
