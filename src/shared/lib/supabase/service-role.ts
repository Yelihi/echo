import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

type SupabaseServiceRoleConfig = {
  url: string;
  serviceRoleKey: string;
};

let serviceRoleClient: SupabaseClient<Database> | null = null;

function getSupabaseServiceRoleConfig(): SupabaseServiceRoleConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service-role environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return { url, serviceRoleKey };
}

export function getSupabaseServiceRoleClient(): SupabaseClient<Database> {
  if (!serviceRoleClient) {
    const { url, serviceRoleKey } = getSupabaseServiceRoleConfig();

    serviceRoleClient = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceRoleClient;
}
