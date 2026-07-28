import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * Figma "Echo Design System" 파일과 1:1로 대응하는 토큰 문서입니다.
 * https://www.figma.com/design/4hKG57XYIE01IrrfDQT7eE
 *
 * 상단 툴바의 Pillar를 Memorization으로 바꾸면 accent 토큰이 함께 전환됩니다.
 */
const meta = {
  title: "foundations/Design System",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" },
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

export const Colors: Story = {
  render: () => (
    <div className="flex flex-col gap-10 bg-gray-background p-10">
      <Section
        title="Semantic"
        hint="src/app/global.css의 @theme 토큰. Figma Color 컬렉션과 이름이 같습니다."
      >
        <div className="flex flex-wrap gap-4">
          {SEMANTIC.map(([cls, name, token]) => (
            <Swatch key={name} className={cls} name={name} token={token} />
          ))}
        </div>
      </Section>

      <Section
        title="Accent — 필라에 따라 전환"
        hint="상단 툴바의 Pillar를 Memorization으로 바꾸면 아래 램프 전체가 네이비로 바뀝니다."
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
    <div className="flex flex-col gap-6 bg-gray-background p-10">
      <Section title="Typography" hint="크기 / 행간 / 자간 모두 Figma 텍스트 스타일과 동일합니다.">
        <div className="divide-y divide-card-line rounded-2xl border border-card-line bg-card-surface">
          {TYPE.map(([cls, name, spec]) => (
            <div key={cls} className="flex items-center gap-8 px-7 py-5">
              <div className="w-[150px] shrink-0">
                <p className="text-body-2 font-medium text-black-primary">{name}</p>
                <p className="text-body-1 text-gray-text">{spec}</p>
                <p className="text-body-1 text-blue-sub-paragraph">{cls}</p>
              </div>
              <p className={`${cls} text-black-primary`}>
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
    <div className="flex flex-col gap-6 bg-gray-background p-10">
      <Section title="Elevation" hint="Figma의 Effect Style과 동일한 값입니다.">
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
