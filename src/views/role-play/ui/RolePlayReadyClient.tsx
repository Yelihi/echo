"use client";

import { Bot, Clock, MessageSquare, Mic2, Play, RotateCcw, User } from "lucide-react";
import { useState } from "react";

import { Button, Chip } from "@/shared/components";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import {
  RoleCard,
  SegmentedControl,
  SegmentedControlItem,
  SelectableOptionCard,
  SessionReadyHero,
  SliderField,
  VoicePill,
} from "@/shared/components/ui";
import { SessionReadyShell } from "@/widgets/session-ready";
import {
  ROLE_PLAY_READY_EVALUATION_MODES,
  ROLE_PLAY_READY_ROLE_OPTIONS,
  ROLE_PLAY_READY_VOICE_OPTIONS,
} from "@/views/role-play/config/const";
import type {
  RoleplayReadyEvaluationMode,
  RoleplayReadyMaterial,
  RoleplayReadyRole,
  RoleplayReadyVoice,
} from "@/views/role-play/models/ready";

interface RolePlayReadyClientProps {
  material: RoleplayReadyMaterial;
}

export function RolePlayReadyClient({ material }: RolePlayReadyClientProps) {
  const [selectedRole, setSelectedRole] = useState<RoleplayReadyRole>("learner");
  const [evaluationMode, setEvaluationMode] = useState<RoleplayReadyEvaluationMode>("exact");
  const [voice, setVoice] = useState<RoleplayReadyVoice>("soft");
  const [speed, setSpeed] = useState(1);

  const startSession = () => {
    void { materialId: material.id, selectedRole, evaluationMode, voice, speed };
    // TODO: create a roleplay session snapshot with the selected settings, then route to practice.
  };

  return (
    <SessionReadyShell
      pillar="roleplay"
      backHref="/role-playing"
      backLabel="롤플레잉 목록으로 돌아가기"
      totalSteps={material.lineCount}
    >
      <div className="flex flex-col gap-5">
        <SessionReadyHero
          theme="roleplay"
          tags={material.tags}
          title={material.title}
          subtitle={material.description}
        >
          <StatItem icon={<MessageSquare />} label="문장" value={`${material.lineCount}개`} />
          <StatItem icon={<Mic2 />} label="내 차례" value={`${material.learnerTurnCount}번`} />
          <StatItem icon={<Clock />} label="예상 시간" value={`${material.estimatedMinutes}분`} />
        </SessionReadyHero>

        <div className="rounded-hero border border-session-glass-line bg-session-glass p-5 text-white shadow-heavy backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-heading-xs font-bold">시작 전 설정</h2>
              <p className="mt-1 text-body-3 text-white/65">
                시작할 때마다 기본값에서 다시 선택합니다.
              </p>
            </div>
            <Chip tone="roleplay">{material.difficulty}</Chip>
          </div>

          <div className="grid gap-4 md:grid-cols-2" role="radiogroup" aria-label="역할 선택">
            {ROLE_PLAY_READY_ROLE_OPTIONS.map((option) => (
              <RoleCard
                key={option.value}
                role="radio"
                aria-checked={selectedRole === option.value}
                selected={selectedRole === option.value}
                title={option.title}
                description={option.description}
                onClick={() => setSelectedRole(option.value)}
              />
            ))}
          </div>
        </div>
      </div>

      <aside className="rounded-hero border border-card-line bg-white p-5 text-black-primary shadow-heavy">
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-heading-xs font-bold">평가 모드</h2>
              <SegmentedControl
                value={evaluationMode}
                onValueChange={(value) =>
                  value && setEvaluationMode(value as RoleplayReadyEvaluationMode)
                }
                aria-label="평가 모드"
              >
                <SegmentedControlItem value="exact">Exact</SegmentedControlItem>
                <SegmentedControlItem value="context">Context</SegmentedControlItem>
              </SegmentedControl>
            </div>
            <div className="grid gap-3" role="radiogroup" aria-label="평가 방식 상세 선택">
              {ROLE_PLAY_READY_EVALUATION_MODES.map((option) => (
                <SelectableOptionCard
                  key={option.value}
                  role="radio"
                  aria-checked={evaluationMode === option.value}
                  selected={evaluationMode === option.value}
                  icon={option.value === "exact" ? <MessageSquare /> : <Bot />}
                  title={option.title}
                  description={option.description}
                  onClick={() => setEvaluationMode(option.value)}
                />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-heading-xs font-bold">상대방 음성</h2>
            <div className="flex gap-2" role="radiogroup" aria-label="TTS 목소리 선택">
              {ROLE_PLAY_READY_VOICE_OPTIONS.map((option) => (
                <VoicePill
                  key={option.value}
                  role="radio"
                  aria-checked={voice === option.value}
                  selected={voice === option.value}
                  icon={<User />}
                  label={option.label}
                  sub={option.sub}
                  onClick={() => setVoice(option.value)}
                />
              ))}
            </div>
          </section>

          <SliderField
            label="말하기 속도"
            valueLabel={`${speed.toFixed(1)}x`}
            min={0.7}
            max={1.3}
            step={0.1}
            value={speed}
            onChange={setSpeed}
            minLabel="느리게"
            midLabel="보통"
            maxLabel="빠르게"
          />

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setSpeed(1)}>
              <RotateCcw /> 초기화
            </Button>
            <Button type="button" className="flex-1" onClick={startSession}>
              <Play /> 시작하기
            </Button>
          </div>
        </div>
      </aside>
    </SessionReadyShell>
  );
}
