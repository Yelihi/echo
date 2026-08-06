import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return children;
}
