import { LoginButton } from "@/features/login";
import { Google } from "@/shared/components";

export function ButtonSection() {
  return (
    <section className="bg-white rounded-20 p-[28px] w-[410px] flex justify-center items-center shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col justify-center items-center gap-7 w-full">
        <div className="flex flex-col justify-center items-center gap-2 w-full">
          <p className="text-[18px] font-semibold text-black tracking-tight">
            다시 오신걸 환경해요
          </p>
          <p className="text-[14px] font-normal text-fg-neutral-alternative tracking-tight">
            기존 계정으로 간편하게 시작하세요.
          </p>
        </div>
        <LoginButton provider="google">
          <Google className="size-[22px]" /> Google로 시작하기
        </LoginButton>
      </div>
    </section>
  );
}
