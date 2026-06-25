// shared
import { Pluse } from "@/shared/components";

import { ButtonSection } from "@/views/login/ui/ButtonSection";

export function LoginView() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center gap-[2rem] z-10">
      <div className="flex justify-center items-center rounded-[20px] size-[66px] bg-blue-primary shadow-md">
        <Pluse className="size-[28px] text-white" />
      </div>
      <div className="flex flex-col justify-center items-center gap-3">
        <h2 className="text-heading-lg font-extrabold tracking-tight text-black-primary">Echo</h2>
        <p className="text-body-5 font-normal tracking-tight text-black-secondary text-center">
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
