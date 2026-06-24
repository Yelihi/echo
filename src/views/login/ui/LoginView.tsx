// shared
import { Pluse } from "@/shared/components";

import { ButtonSection } from "@/views/login/ui/ButtonSection";

export function LoginView() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-[2rem] z-10">
      <div className="flex justify-center items-center rounded-[20px] size-[66px] bg-fg-accent-primary shadow-md">
        <Pluse className="size-[28px] text-white" />
      </div>
      <div className="flex flex-col justify-center items-center gap-3">
        <h2 className="text-[32px] font-extrabold tracking-tight text-black">Echo</h2>
        <p className="text-[16px] font-normal tracking-tight text-fg-neutral-alternative text-center">
          혼자서도 실제 대화처럼.
          <br />
          롤플레잉으로 말하고, 긴 문장은 암기로 다져요.
        </p>
      </div>
      <ButtonSection />
      <p className="text-[12px] font-normal text-fg-neutral-assistive text-center">
        By proceeding,
        <br /> you agree to Echo's <span className="font-semibold">Licence Agreement</span> and{" "}
        <span className="font-semibold">Privacy Policy</span>
      </p>
    </main>
  );
}
