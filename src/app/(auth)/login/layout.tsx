import { PageEnter } from "@/shared/components/motion/PageEnter";
function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative flex w-full min-h-lvh justify-center items-center bg-gray-background overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute top-[-260px] left-1/2 -translate-x-1/2 size-full pointer-events-none"
      >
        <div className="relative size-full">
          <div className="absolute top-[15%] -translate-y-1/2 left-1/2 -translate-x-1/2 m-auto rounded-full border border-blue-primary/20 animate-login-ring motion-reduce:animate-none size-[360px]"></div>
          <div className="absolute top-[15%] -translate-y-1/2 left-1/2 -translate-x-1/2 m-auto rounded-full border border-blue-primary/25 animate-login-ring motion-reduce:animate-none [animation-delay:0.6s] size-[540px]"></div>
          <div className="absolute top-[15%] -translate-y-1/2 left-1/2 -translate-x-1/2 m-auto rounded-full border border-blue-primary/30 animate-login-ring motion-reduce:animate-none [animation-delay:1.2s] size-[720px]"></div>
        </div>
      </div>
      <PageEnter>{children}</PageEnter>
    </section>
  );
}

export default LoginLayout;
