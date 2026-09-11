import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/shared/components/atomics/button/Button";
import { Input } from "@/shared/components/atomics/input/Input";

/** Silver & Ink. Tokens live in global.css; adoption rules in docs/design-system.md. */
const meta = {
  title: "foundations/Design System",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-heading-sm font-bold text-black-primary">{title}</h2>
        {hint && <p className="text-body-2 text-gray-text">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Swatch({ className, name, token }: { className: string; name: string; token: string }) {
  return (
    <div className="flex w-[150px] flex-col gap-1.5">
      <div className={`h-16 rounded-xl border border-card-line ${className}`} />
      <p className="text-body-1 font-medium text-black-primary">{name}</p>
      <p className="text-body-1 text-gray-text">{token}</p>
    </div>
  );
}

const SEMANTIC: Array<[string, string, string]> = [
  ["bg-brand", "Ink · #1E1D1D", "--color-brand"],
  ["bg-silver", "Silver · #B6BEC6", "--color-silver"],
  ["bg-card-surface", "Paper · #FFFFFF", "--color-card-surface"],
  ["bg-gray-background", "Mist · #F9F9F9", "--color-gray-background"],
  ["bg-blue-primary", "blue-primary", "--color-blue-primary"],
  ["bg-blue-secondary", "blue-secondary", "--color-blue-secondary"],
  ["bg-blue-border", "blue-border", "--color-blue-border"],
  ["bg-blue-hover", "blue-hover", "--color-blue-hover"],
  ["bg-deep-blue-primary", "deep-blue-primary", "--color-deep-blue-primary"],
  ["bg-deep-blue-secondary", "deep-blue-secondary", "--color-deep-blue-secondary"],
  ["bg-black-primary", "black-primary", "--color-black-primary"],
  ["bg-black-secondary", "black-secondary", "--color-black-secondary"],
  ["bg-gray-background", "gray-background", "--color-gray-background"],
  ["bg-gray-border", "gray-border", "--color-gray-border"],
  ["bg-green-secondary", "green-secondary", "--color-green-secondary"],
  ["bg-yellow-secondary", "yellow-secondary", "--color-yellow-secondary"],
  ["bg-red-secondary", "red-secondary", "--color-red-secondary"],
  ["bg-card-line-strong", "card-line-strong", "--color-card-line-strong"],
];

const ACCENT: Array<[string, string]> = [
  ["bg-accent-50", "accent-50"],
  ["bg-accent-100", "accent-100"],
  ["bg-accent-200", "accent-200"],
  ["bg-accent-300", "accent-300"],
  ["bg-accent-400", "accent-400"],
  ["bg-accent-500", "accent-500"],
  ["bg-accent-600", "accent-600"],
  ["bg-accent-700", "accent-700"],
  ["bg-accent-800", "accent-800"],
  ["bg-accent-glow", "accent-glow"],
];

const TYPE: Array<[string, string, string]> = [
  ["text-display", "Display", "40–72 / 1.12 / -0.045em"],
  ["text-heading-lg", "Heading LG", "32 / 43 / -0.027em"],
  ["text-heading-md", "Heading MD", "27 / 37 / -0.024em"],
  ["text-heading-sm", "Heading SM", "20 / 28 / -0.012em"],
  ["text-heading-xs", "Heading XS", "18 / 26 / -0.004em"],
  ["text-subtitle-lg", "Subtitle LG", "14 / 20 / 0.012em"],
  ["text-subtitle-md", "Subtitle MD", "13 / 18 / 0.018em"],
  ["text-subtitle-sm", "Subtitle SM", "12 / 16 / 0.024em"],
  ["text-body-6", "Body 6", "30 / 45"],
  ["text-body-5", "Body 5", "16 / 24"],
  ["text-body-4", "Body 4", "15 / 23"],
  ["text-body-3", "Body 3", "14 / 21"],
  ["text-body-2", "Body 2", "13 / 20"],
  ["text-body-1", "Body 1", "12 / 18"],
];

const SHADOWS: Array<[string, string]> = [
  ["shadow-button", "shadow-button"],
  ["shadow-emphasize", "shadow-emphasize"],
  ["shadow-strong", "shadow-strong"],
  ["shadow-heavy", "shadow-heavy"],
  ["shadow-modal", "shadow-modal"],
];

export const Overview: Story = {
  render: () => (
    <main className="mx-auto max-w-page bg-card-surface p-page-gutter text-black-primary">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-card-line-strong pb-6">
        <span className="text-heading-sm font-bold tracking-tight">Echo / Design System</span>
        <span className="rounded-pill border border-control-line px-4 py-2 text-body-2">
          Silver & Ink · 01
        </span>
      </header>
      <section className="grid gap-8 py-section md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <p className="mb-6 text-subtitle-sm font-medium uppercase tracking-widest text-gray-text">
            A little space. A clearer voice.
          </p>
          <h1 className="text-display">
            말하는 순간에,
            <br />
            집중할 수 있도록.
          </h1>
          <p className="mt-6 max-w-md text-body-5 text-gray-text">
            흰 여백, 차분한 실버, 또렷한 차콜.
            <br />
            장식은 줄이고 연습의 내용과 다음 행동을 선명하게 보여줍니다.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex aspect-square items-center justify-center overflow-hidden rounded-hero bg-silver"
        >
          <div className="flex size-3/4 items-center justify-center rounded-full border border-brand/30">
            <div className="flex size-3/4 items-center justify-center rounded-full border border-brand/40">
              <div className="size-1/2 rounded-full bg-brand" />
            </div>
          </div>
        </div>
      </section>
      <section aria-label="핵심 팔레트" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Paper", "#FFFFFF", "bg-card-surface text-black-primary"],
          ["Mist", "#F9F9F9", "bg-gray-background text-black-primary"],
          ["Silver", "#B6BEC6", "bg-silver text-black-primary"],
          ["Ink", "#1E1D1D", "bg-brand text-on-brand"],
        ].map(([name, hex, cls]) => (
          <div
            key={name}
            className={`flex min-h-40 flex-col justify-between rounded-card border border-card-line p-6 ${cls}`}
          >
            <span className="text-body-3">{name}</span>
            <span className="text-heading-xs font-medium">{hex}</span>
          </div>
        ))}
      </section>
      <p className="mt-8 text-body-3 text-gray-text">
        Foundation → Shared components → Widgets → Views. 이번 단계는 토큰과 사용 기준을 정의합니다.
      </p>
    </main>
  ),
};

export const Geometry: Story = {
  render: () => (
    <main className="flex flex-col gap-section bg-card-surface p-page-gutter">
      <Section
        title="Shape & Space"
        hint="4px 간격 단위 · 입력 12px · 패널 20px · 카드 28px · 히어로 36px · 버튼과 칩은 pill"
      >
        <div className="flex flex-wrap gap-6">
          {["rounded-control", "rounded-panel", "rounded-card", "rounded-hero", "rounded-pill"].map(
            (radius) => (
              <div
                key={radius}
                className={`${radius} flex h-28 w-44 items-center justify-center border border-control-line bg-gray-background text-body-2`}
              >
                {radius}
              </div>
            ),
          )}
        </div>
      </Section>
      <Section
        title="기존 컴포넌트에 적용된 토큰"
        hint="기존 API와 동작을 유지합니다. shared/Silver & Ink에서 컴포넌트 조합과 상호작용을 확인할 수 있습니다."
      >
        <div className="flex flex-wrap gap-3">
          <Button>기본 동작</Button>
          <Button variant="outline">보조 동작</Button>
          <Button disabled>비활성</Button>
        </div>
        <label className="flex max-w-sm flex-col gap-2 text-body-3">
          연습 제목
          <Input placeholder="오늘 연습할 내용을 입력하세요" />
        </label>
      </Section>
    </main>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-10 bg-gray-background p-page-gutter">
      <Section
        title="Semantic"
        hint="실버는 큰 배경과 장식에, 차콜은 본문과 주요 동작에 사용합니다. blue 계열 이름은 기존 코드 호환용입니다."
      >
        <div className="flex flex-wrap gap-4">
          {SEMANTIC.map(([cls, name, token]) => (
            <Swatch key={name} className={cls} name={name} token={token} />
          ))}
        </div>
      </Section>

      <Section
        title="Accent — 공통 Steel 램프"
        hint="두 필라는 동일한 중립 팔레트를 공유합니다. 기능 구분은 제목·아이콘·선택 상태로 전달합니다."
      >
        <div className="flex flex-wrap gap-2">
          {ACCENT.map(([cls, name]) => (
            <div key={name} className="flex w-[92px] flex-col gap-1.5">
              <div className={`h-14 rounded-lg border border-card-line ${cls}`} />
              <p className="text-body-1 text-gray-text">{name}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-gray-background p-page-gutter">
      <Section
        title="Typography"
        hint="Noto Sans KR 유지. 큰 제목은 Bold와 조밀한 자간, 본문은 Regular와 여유 있는 행간을 사용합니다."
      >
        <div className="divide-y divide-card-line rounded-2xl border border-card-line bg-card-surface">
          {TYPE.map(([cls, name, spec]) => (
            <div
              key={cls}
              className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:gap-8"
            >
              <div className="w-[150px] shrink-0">
                <p className="text-body-2 font-medium text-black-primary">{name}</p>
                <p className="text-body-1 text-gray-text">{spec}</p>
                <p className="text-body-1 text-blue-sub-paragraph">{cls}</p>
              </div>
              <p className={`${cls} min-w-0 break-keep text-black-primary`}>
                오늘 배운 문장을 말해보세요 · Speak the sentence
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Elevation: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-gray-background p-page-gutter">
      <Section
        title="Elevation"
        hint="일반 카드는 면과 얇은 선으로 구분하고, 그림자는 떠 있는 요소에 제한합니다."
      >
        <div className="flex flex-wrap gap-6">
          {SHADOWS.map(([cls, name]) => (
            <div key={name} className="flex w-[220px] flex-col gap-3">
              <div className={`h-24 rounded-2xl bg-card-surface ${cls}`} />
              <p className="text-body-2 text-gray-text">{name}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
