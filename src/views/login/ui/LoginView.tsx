import { ButtonSection } from "@/views/login/ui/ButtonSection";

export function LoginView() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-2">
      <h2 className="text-body-2 font-bold text-black">Echo</h2>
      <ButtonSection />
    </main>
  );
}
