import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { FetchClient } from "../provider";

describe("FetchClient", () => {
  const fetchMock = jest.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("applies origin and default fetch options to GET requests", async () => {
    const client = new FetchClient({
      origin: "https://api.example.com",
      fetcher: fetchMock,
      options: {
        credentials: "include",
        cache: "no-store",
      },
    });

    await client.get("/todos");

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/todos", {
      credentials: "include",
      cache: "no-store",
      method: "GET",
    });
  });

  const methods: Array<["post" | "put" | "patch" | "delete", string]> = [
    ["post", "POST"],
    ["put", "PUT"],
    ["patch", "PATCH"],
    ["delete", "DELETE"],
  ];

  it.each(methods)("sets %s request method", async (methodName, method) => {
    const client = new FetchClient({
      origin: "https://api.example.com",
      fetcher: fetchMock,
      options: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    });

    await client[methodName]("/todos/1", {
      body: JSON.stringify({ title: "Practice speaking" }),
    });

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.com/todos/1", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Practice speaking" }),
      method,
    });
  });
});
