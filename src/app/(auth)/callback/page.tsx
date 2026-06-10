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
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
      <AuthCallbackContent provider={provider as SupabaseAuthConnectedProvider} />
    </main>
  );
}

export default CallbackPage;
