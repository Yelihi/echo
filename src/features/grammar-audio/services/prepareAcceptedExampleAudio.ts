import "server-only";
import { GrammarAudioJobRepository, prepareExampleAudio } from "@/entities/grammar-audio/server";
import type { ExampleAudioCommand } from "@/entities/grammar-audio";
import { getSupabaseServiceRoleClient } from "@/shared/lib/supabase/service-role";
import { getOpenAITTSModel } from "@/shared/lib/openai/server";
import { recordOperationEvent } from "@/shared/lib/logging/pino";

export function prepareAcceptedExampleAudio(
  ownerId: string,
  command: ExampleAudioCommand,
  retry = false,
) {
  return prepareExampleAudio(
    command,
    {
      createRepository: () =>
        new GrammarAudioJobRepository(
          getSupabaseServiceRoleClient(),
          ownerId,
          getOpenAITTSModel(),
          process.env.PROCESS_GRAMMAR_AUDIO_SECRET,
        ),
      recordEvent: recordOperationEvent,
    },
    retry,
  );
}
