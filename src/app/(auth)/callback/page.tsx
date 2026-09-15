import { AuthCallbackContent } from "@/views/callback";
import type { SupabaseAuthConnectedProvider } from "@/features/login/models/interface";

async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const provider = typeof params.provider === "string" ? params.provider : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-background px-6 py-10 text-center">
      <AuthCallbackContent provider={provider as SupabaseAuthConnectedProvider} />
    </main>
  );
}

export default CallbackPage;
