import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { NavigationContainer } from "@/widgets/navigation/ui/NavigationContainer";

export default async function SessionLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-lvh bg-surface-app-warm text-black-primary">
      <header className="sticky top-0 z-20 h-[62px]">
        <NavigationContainer />
      </header>
      <section className="mx-auto w-full max-w-[792px] px-4 pb-10 pt-[30px]">{children}</section>
    </main>
  );
}
