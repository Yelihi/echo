"use client";

import { BookOpen, Clock, FileText, Languages, Pilcrow, Play, Type } from "lucide-react";
import type React from "react";
import { useState } from "react";

import { Button, Chip } from "@/shared/components";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import { SelectableOptionCard, SessionReadyHero } from "@/shared/components/ui";
import { SessionReadyShell } from "@/widgets/session-ready";
import type {
  MemorizationReadyMaterial,
  MemorizationReadyMode,
} from "@/views/memorization/models/ready";

interface MemorizationReadyClientProps {
  material: MemorizationReadyMaterial;
}

const modeOptions: Array<{
  value: MemorizationReadyMode;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    value: "read",
    title: "본문 보고 말하기",
    description: "원문을 보며 전체 문단을 한 번에 녹음합니다.",
    icon: <BookOpen />,
  },
  {
    value: "translate",
    title: "번역 보고 말하기",
    description: "한국어 힌트를 보고 영어 문장을 회상합니다.",
    icon: <Languages />,
  },
  {
    value: "title",
    title: "제목만 보고 말하기",
    description: "제목만 보고 전체 흐름을 떠올립니다.",
    icon: <Type />,
  },
];

export function MemorizationReadyClient({ material }: MemorizationReadyClientProps) {
  const [mode, setMode] = useState<MemorizationReadyMode>("read");

  const startSession = () => {
    void { materialId: material.id, mode };
    // TODO: create a memorization session snapshot, prepare translation when needed, then route to practice.
  };

  return (
    <SessionReadyShell
      pillar="memo"
      backHref="/sentence-memorization"
      backLabel="문장 암기 목록으로 돌아가기"
      totalSteps={material.paragraphCount}
    >
      <div className="flex flex-col gap-5">
        <SessionReadyHero
          theme="memo"
          tags={material.tags}
          title={material.title}
          subtitle={material.description}
        >
          <StatItem icon={<Pilcrow />} label="문단" value={`${material.paragraphCount}개`} />
          <StatItem icon={<FileText />} label="단어" value={`${material.wordCount}개`} />
          <StatItem icon={<Clock />} label="예상 시간" value={`${material.estimatedMinutes}분`} />
        </SessionReadyHero>

        <div className="rounded-hero border border-session-glass-line bg-session-glass p-5 text-white shadow-heavy backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-heading-xs font-bold">녹음 방식</h2>
              <p className="mt-1 text-body-3 text-white/65">
                전체 본문을 한 번의 녹음으로 기록합니다.
              </p>
            </div>
            <Chip tone="memo">{material.difficulty}</Chip>
          </div>
        </div>
      </div>

      <aside className="rounded-hero border border-card-line bg-white p-5 text-black-primary shadow-heavy">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <h2 className="text-heading-xs font-bold">연습 모드</h2>
            <div className="grid gap-3" role="radiogroup" aria-label="문장 암기 연습 모드 선택">
              {modeOptions.map((option, index) => (
                <SelectableOptionCard
                  key={option.value}
                  role="radio"
                  aria-checked={mode === option.value}
                  selected={mode === option.value}
                  icon={option.icon}
                  badge={index + 1}
                  title={option.title}
                  description={option.description}
                  extra={
                    option.value === "translate" && mode === "translate" ? (
                      <span className="mt-1.5 block text-body-1 font-bold text-accent-700">
                        번역 준비 예정
                      </span>
                    ) : undefined
                  }
                  onClick={() => setMode(option.value)}
                />
              ))}
            </div>
          </section>

          <Button type="button" size="lg" onClick={startSession}>
            <Play /> 시작하기
          </Button>
        </div>
      </aside>
    </SessionReadyShell>
  );
}
