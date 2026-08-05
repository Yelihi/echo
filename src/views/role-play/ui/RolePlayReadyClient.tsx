"use client";

import { Clock, MessageSquare, Mic2, Play, Shuffle, Target, Volume2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/shared/components";
import { StatItem } from "@/shared/components/atomics/stat-item/StatItem";
import {
  RoleCard,
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
  const [evaluationMode, setEvaluationMode] = useState<RoleplayReadyEvaluationMode>("context");
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
      <SessionReadyHero
        className="w-full"
        theme="roleplay"
        tags={material.tags}
        title={material.title}
        subtitle={material.description}
      >
        <StatItem icon={<MessageSquare />} label="총 대사" value={material.lineCount} />
        <StatItem icon={<Mic2 />} label="내 차례" value={material.learnerTurnCount} />
        <StatItem icon={<Clock />} label="예상 시간" value={`~${material.estimatedMinutes}분`} />
      </SessionReadyHero>

      <section className="flex flex-col gap-3.5">
        <div>
          <h2 className="text-[17px] font-bold leading-normal">역할 선택</h2>
          <p className="mt-1 text-[13.5px] text-gray-text">
            어느 쪽을 맡아 말할지 골라보세요. 상대방 대사는 컴퓨터가 읽어줘요.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="역할 선택">
          {ROLE_PLAY_READY_ROLE_OPTIONS.map((option) => (
            <RoleCard
              key={option.value}
              role="radio"
              aria-checked={selectedRole === option.value}
              selected={selectedRole === option.value}
              className="h-[100px] p-[18px]"
              title={option.title}
              description={option.description}
              onClick={() => setSelectedRole(option.value)}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-[42px] w-full border-dashed bg-white font-bold text-accent-700"
          onClick={() => setSelectedRole(selectedRole === "learner" ? "partner" : "learner")}
        >
          <Shuffle className="size-[17px]" /> 역할 바꾸기
        </Button>
      </section>

      <section className="flex flex-col gap-3.5">
        <div>
          <h2 className="text-[17px] font-bold leading-normal">평가 모드</h2>
          <p className="mt-1 text-[13.5px] text-gray-text">
            얼마나 엄격하게 비교할지 골라보세요. 틀려도 괜찮아요.
          </p>
        </div>
        <div className="grid gap-3" role="radiogroup" aria-label="평가 방식 상세 선택">
          {ROLE_PLAY_READY_EVALUATION_MODES.map((option) => (
            <SelectableOptionCard
              key={option.value}
              role="radio"
              aria-checked={evaluationMode === option.value}
              selected={evaluationMode === option.value}
              className="h-[74px] px-[18px] py-4"
              icon={option.value === "exact" ? <Target /> : <MessageSquare />}
              title={option.title}
              description={option.description}
              onClick={() => setEvaluationMode(option.value)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3.5">
        <div>
          <h2 className="text-[17px] font-bold leading-normal">상대방 음성</h2>
          <p className="mt-1 text-[13.5px] text-gray-text">
            컴퓨터가 읽어줄 목소리와 속도를 골라보세요.
          </p>
        </div>
        <div className="rounded-panel border border-card-line bg-white px-[22px] py-5">
          <div className="flex gap-2.5" role="radiogroup" aria-label="TTS 목소리 선택">
            {ROLE_PLAY_READY_VOICE_OPTIONS.map((option) => (
              <VoicePill
                key={option.value}
                role="radio"
                aria-checked={voice === option.value}
                selected={voice === option.value}
                className="h-[92px]"
                icon={<Volume2 />}
                label={option.label}
                sub={option.sub}
                onClick={() => setVoice(option.value)}
              />
            ))}
          </div>

          <SliderField
            className="mt-[18px]"
            label="말하기 속도"
            valueLabel={`${speed.toFixed(2)}×`}
            min={0.7}
            max={1.3}
            step={0.1}
            value={speed}
            onChange={setSpeed}
            minLabel="천천히"
            midLabel="보통"
            maxLabel="빠르게"
          />
        </div>
      </section>

      <Button
        type="button"
        className="h-9 w-full bg-accent-600 hover:bg-accent-700"
        onClick={startSession}
      >
        <Play /> 연습 시작하기
      </Button>
    </SessionReadyShell>
  );
}
