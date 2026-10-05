import "server-only";
import { createHash } from "node:crypto";
import type { GrammarAudioResult } from "../models/interface";
// 프로세스 내 최근 32개 음성만 10분간 재사용한다. 영구 저장·인스턴스 간 캐시는 아니다.
const cache = new Map<string, { expires: number; result: Promise<GrammarAudioResult> }>();
export function grammarAudioCacheKey(owner: string, text: string, model: string) {
  return createHash("sha256")
    .update(JSON.stringify([owner, text, "alloy", 1, model]))
    .digest("hex");
}
export async function cachedGrammarAudio(
  key: string,
  generate: () => Promise<GrammarAudioResult>,
): Promise<GrammarAudioResult> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.result;
  if (cache.size >= 32) cache.delete(cache.keys().next().value!);
  const result = generate();
  cache.set(key, { expires: Date.now() + 600000, result });
  try {
    const value = await result;
    if (!value.ok) cache.delete(key);
    return value;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
}
