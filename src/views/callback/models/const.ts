import type { SupabaseAuthConnectedProvider } from "@/features/login";

export const SUPPORTED_PROVIDERS = new Set<SupabaseAuthConnectedProvider>(["google"]);
