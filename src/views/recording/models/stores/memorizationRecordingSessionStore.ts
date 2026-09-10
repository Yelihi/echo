import { createStoreApi } from "@/shared/lib/store/create-store";
import {
  createRecordingSessionBaseSlice,
  type HydrateRecordingSessionInput,
  type RecordingSessionBaseStore,
} from "@/views/recording/models/stores/createRecordingSessionStore";

export type MemorizationRecordingSessionStore = RecordingSessionBaseStore;

export function createMemorizationRecordingSessionStore(initial: HydrateRecordingSessionInput) {
  return createStoreApi<MemorizationRecordingSessionStore>("memorizationRecordingSession", (set) =>
    createRecordingSessionBaseSlice<MemorizationRecordingSessionStore>(set, initial),
  );
}
