import { LoginButton } from "@/features/login";
import { Google } from "@/shared/components";

export function ButtonSection() {
  return (
    <section className="flex w-full max-w-md items-center justify-center bg-white">
      <div className="flex flex-col justify-center items-center gap-7 w-full">
        <div className="flex flex-col justify-center items-start gap-2 w-full">
          <p className="text-heading-md font-normal text-black-primary tracking-tight">
            다시 오신 걸 환영해요
          </p>
          <p className="text-body-3 font-normal text-gray-text tracking-tight">
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
