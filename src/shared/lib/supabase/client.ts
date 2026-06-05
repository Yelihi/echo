import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

let browserClient: SupabaseClient | null = null;

function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return { url, publishableKey };
}

export function createSupabaseBrowserClient(): SupabaseClient {
  const { url, publishableKey } = getSupabaseConfig();

  return createBrowserClient(url, publishableKey);
}

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient();
  }

  return browserClient;
}
