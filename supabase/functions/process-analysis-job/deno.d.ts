// Supabase Edge Function은 Deno 런타임에서 동작하지만, 이 repo의 기본 TypeScript
// 검사기는 Next/Node 설정을 기준으로 실행됩니다. 이 파일은 Edge Function 전용
// Deno global과 import-map 모듈을 에디터/typecheck가 이해하도록 하는 최소 shim입니다.
export {};

declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };

    export function serve(handler: (request: Request) => Response | Promise<Response>): void;
  }
}

declare module "supabase-js" {
  type QueryResult<T> = Promise<{ data: T | null; error: unknown }>;

  type QueryBuilder = PromiseLike<{ data: unknown[] | null; error: unknown }> & {
    select(columns?: string): QueryBuilder;
    eq(column: string, value: unknown): QueryBuilder;
    order(column: string, options?: { ascending?: boolean }): QueryBuilder;
    insert(value: unknown): QueryResult<unknown>;
    maybeSingle(): QueryResult<unknown>;
  };

  type StorageBucket = {
    download(path: string): Promise<{ data: Blob; error: unknown }>;
  };

  type SupabaseClient = {
    from(table: string): QueryBuilder;
    rpc(name: string, args?: Record<string, unknown>): QueryBuilder;
    storage: {
      from(bucket: string): StorageBucket;
    };
  };

  export function createClient(...args: unknown[]): SupabaseClient;
}
