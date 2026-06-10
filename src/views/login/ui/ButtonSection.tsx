import { LoginButton } from "@/features/login";
import { Google } from "@/shared/components";

export function ButtonSection() {
  return (
    <section className="bg-white rounded-4 p-10 flex justify-center items-center shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col justify-center items-center">
        <LoginButton provider="google">
          <Google className="size-20" /> Google 로 시작하기
        </LoginButton>
      </div>
    </section>
  );
}
