// shared
import { Pluse } from "@/shared/components";

import { ButtonSection } from "@/views/login/ui/ButtonSection";

export function LoginView() {
  return (
    <main className="relative z-10 flex w-full flex-col items-center justify-center gap-8 px-page-gutter py-12">
      <div className="flex justify-center items-center rounded-full size-16 bg-brand">
        <Pluse className="size-[28px] text-white" />
      </div>
      <div className="flex flex-col justify-center items-center gap-3">
        <h1 className="text-display text-black-primary">Echo</h1>
        <p className="text-body-4 leading-relaxed font-normal tracking-tight text-black-secondary text-center">
          혼자서도 실제 대화처럼.
          <br />
          롤플레잉으로 말하고, 긴 문장은 암기로 다져요.
        </p>
      </div>
      <ButtonSection />
      <p className="text-body-1 font-normal text-gray-text-secondary text-center">
        By proceeding,
        <br /> you agree to Echo's <span className="font-semibold">Licence Agreement</span> and{" "}
        <span className="font-semibold">Privacy Policy</span>
      </p>
    </main>
  );
}
