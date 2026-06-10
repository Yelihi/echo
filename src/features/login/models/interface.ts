import { Provider } from "@supabase/supabase-js";

export type SupabaseAuthConnectedProvider = Provider;

// ui
export interface LoginButtonProps {
  children: React.ReactNode;
  provider: SupabaseAuthConnectedProvider;
}
