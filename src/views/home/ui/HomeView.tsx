import { PracticeModeCarousel } from "./PracticeModeCarousel";

export function HomeView() {
  return (
    <div className="mx-auto max-w-[1480px] px-17 pt-8.5 pb-7 max-editor:px-10 max-editor:pt-7 max-md:px-6 max-md:pt-5 max-md:pb-7.5">
      <div className="flex items-center justify-between gap-5 px-1 max-md:block">
        <p className="text-[10px] tracking-[0.18em] text-practice-muted">YOUR ENGLISH, YOUR WAY</p>
        <h1 className="text-[14px] font-normal text-practice-muted max-md:mt-2.5 max-md:text-[13px]">
          오늘은 어떻게 연습할까요?
        </h1>
      </div>
      <PracticeModeCarousel />
    </div>
  );
}
