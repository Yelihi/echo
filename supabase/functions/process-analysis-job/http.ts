export const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
};

export function authorize(request: Request): string | null {
  const secret = Deno.env.get("PROCESS_ANALYSIS_SECRET")?.trim();
  const allowUnauthenticated = Deno.env.get("ALLOW_UNAUTHENTICATED_PROCESS_ANALYSIS") === "true";

  if (!secret) {
    // 운영에서 secret 누락 시 processor가 공개 호출될 수 있으므로 기본값은 차단입니다.
    // 로컬 수동 테스트가 필요할 때만 ALLOW_UNAUTHENTICATED_PROCESS_ANALYSIS=true로 명시적으로 엽니다.
    return allowUnauthenticated ? null : "Missing processor secret";
  }

  return request.headers.get("authorization") === `Bearer ${secret}` ? null : "Unauthorized";
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json",
    },
  });
}
