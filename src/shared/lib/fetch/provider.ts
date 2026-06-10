type Fetcher = typeof fetch;

export type FetchClientConfig = {
  origin?: string;
  options?: RequestInit;
  fetcher?: Fetcher;
};

const defaultFetcher: Fetcher = (input, init) => {
  if (!globalThis.fetch) {
    throw new Error("Fetch API is not available in this runtime.");
  }

  return globalThis.fetch(input, init);
};

function getDefaultOrigin(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
}

function createUrl(origin: string, path: string): string {
  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedOrigin}${normalizedPath}`;
}

export class FetchClient {
  private readonly origin: string;
  private readonly options: RequestInit;
  private readonly fetcher: Fetcher;

  constructor({
    origin = getDefaultOrigin(),
    options = {},
    fetcher = defaultFetcher,
  }: FetchClientConfig = {}) {
    this.origin = origin;
    this.options = options;
    this.fetcher = fetcher;
  }

  get(path: string, options?: RequestInit): Promise<Response> {
    return this.request(path, "GET", options);
  }

  post(path: string, options?: RequestInit): Promise<Response> {
    return this.request(path, "POST", options);
  }

  put(path: string, options?: RequestInit): Promise<Response> {
    return this.request(path, "PUT", options);
  }

  patch(path: string, options?: RequestInit): Promise<Response> {
    return this.request(path, "PATCH", options);
  }

  delete(path: string, options?: RequestInit): Promise<Response> {
    return this.request(path, "DELETE", options);
  }

  private request(path: string, method: string, options?: RequestInit): Promise<Response> {
    return this.fetcher(createUrl(this.origin, path), {
      ...this.options,
      ...options,
      method,
    });
  }
}

export const fetchClient = new FetchClient();
