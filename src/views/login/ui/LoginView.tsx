import Image from "next/image";
import { Wordmark } from "@/shared/components/ui/Wordmark";
import { ButtonSection } from "@/views/login/ui/ButtonSection";

export function LoginView() {
  return (
    <main className="grid min-h-lvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative min-h-80 overflow-hidden p-8 sm:p-12 lg:min-h-lvh">
        <Image
          src="/images/login-architecture.png"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/20" />
        <div className="relative flex h-full flex-col">
          <Wordmark />
          <p className="mt-16 text-display uppercase lg:mt-24">
            Speak.
            <br />
            Repeat.
            <br />
            <span className="text-brand-hover">Make it yours.</span>
          </p>
          <p className="mt-auto pt-12 text-body-3">A little practice. A lasting difference.</p>
        </div>
      </section>
      <section className="flex flex-col items-center justify-center px-6 py-16 sm:px-12">
        <div className="flex w-full max-w-md flex-col gap-10">
          <div>
            <h1 aria-label="Echo">
              <Wordmark className="text-5xl" />
            </h1>
            <p className="mt-6 text-body-4 leading-relaxed text-gray-text">
              혼자서도 실제 대화처럼.
              <br />
              말하고, 반복하고, 나의 영어로 만들어요.
            </p>
          </div>
          <ButtonSection />
          <p className="border-t border-card-line pt-6 text-body-2 text-gray-text">
            Google 계정으로 로그인하고 연습을 이어가세요.
          </p>
        </div>
      </section>
    </main>
  );
}
