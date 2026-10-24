import "server-only";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/lib/supabase/database.types";
import type {
  AudioPreparation,
  ExampleAudioCommand,
  GrammarAudioJobRepositoryPort,
} from "../models/repository";

const assetSchema = z.object({
  sentenceId: z.string(),
  jobId: z.string().optional(),
  revision: z.string().optional(),
  status: z.enum(["missing", "queued", "processing", "ready", "retryable"]),
  code: z.string().optional(),
  objectPath: z.string().optional(),
});

export class GrammarAudioJobRepository implements GrammarAudioJobRepositoryPort {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly ownerId: string,
    private readonly model: string,
    private readonly processorSecret?: string,
  ) {}

  async requestProcessing(): Promise<void> {
    if (!this.processorSecret) throw new Error("AUDIO_PROCESSOR_UNAVAILABLE");
    const { error } = await this.client.functions.invoke("process-grammar-audio-job", {
      headers: { Authorization: `Bearer ${this.processorSecret}` },
      body: {},
      timeout: 3000,
    });
    if (error) throw error;
  }

  private async query(
    command: ExampleAudioCommand,
    enqueue = false,
    retry = false,
    exactSentence?: string,
  ) {
    const { data, error } = await this.client.rpc("example_audio_preparation", {
      p_owner_id: this.ownerId,
      p_note_id: command.noteId,
      p_example_ids: [...command.sentenceIds],
      p_model: this.model,
      p_enqueue: enqueue,
      p_retry: retry,
      p_exact_sentence: exactSentence,
    });
    if (error?.message === "NOT_FOUND" && exactSentence !== undefined) return [];
    if (error) throw error;
    return z.array(assetSchema).parse(data);
  }

  async enqueueExampleAudio(
    command: ExampleAudioCommand,
    retry = false,
  ): Promise<readonly AudioPreparation[]> {
    return (await this.query(command, true, retry)).map(
      ({ sentenceId, jobId, revision, status, code }) => ({
        sentenceId,
        jobId,
        revision,
        status,
        code,
      }),
    );
  }

  async getPreparation(command: ExampleAudioCommand): Promise<readonly AudioPreparation[]> {
    return (await this.query(command)).map(({ sentenceId, jobId, revision, status, code }) => ({
      sentenceId,
      jobId,
      revision,
      status,
      code,
    }));
  }

  async readStoredAudio(command: ExampleAudioCommand, exactSentence: string) {
    const [asset] = await this.query(command, false, false, exactSentence);
    if (asset?.status !== "ready" || !asset.objectPath) return null;
    if (!asset.revision) throw new Error("AUDIO_REVISION_MISSING");
    const { data, error } = await this.client.storage
      .from("grammar-audio")
      .download(asset.objectPath);
    if (error || !data) throw error ?? new Error("AUDIO_READ_FAILED");
    return { audio: await data.arrayBuffer(), revision: asset.revision };
  }
}
