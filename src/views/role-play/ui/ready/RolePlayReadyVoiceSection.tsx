"use client";

import { Volume2 } from "lucide-react";

// shared
import { Card } from "@/shared/components";
import { SliderField, VoicePill } from "@/shared/components/ui";

// views
import { ROLE_PLAY_READY_VOICE_OPTIONS } from "@/views/role-play/config/const";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { RolePlayReadySectionTitle } from "@/views/role-play/ui/ready/RolePlayReadySectionTitle";

function RolePlayReadyVoicePills() {
  const voice = useRolePlayReadyStore((state) => state.settings.voice);

  return (
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
          onClick={() => useRolePlayReadyStore.getState().setVoice(option.value)}
        />
      ))}
    </div>
  );
}

function RolePlayReadySpeedField() {
  const speed = useRolePlayReadyStore((state) => state.settings.speed);

  return (
    <SliderField
      className="mt-[18px]"
      label="말하기 속도"
      valueLabel={`${speed.toFixed(2)}x`}
      min={0.7}
      max={1.3}
      step={0.1}
      value={speed}
      onChange={(nextSpeed) => useRolePlayReadyStore.getState().setSpeed(nextSpeed)}
      minLabel="천천히"
      midLabel="보통"
      maxLabel="빠르게"
    />
  );
}

export function RolePlayReadyVoiceSection() {
  return (
    <section className="flex flex-col gap-3.5">
      <RolePlayReadySectionTitle
        title="상대방 음성"
        description="컴퓨터가 읽어줄 목소리와 속도를 골라보세요."
      />
      <Card variant="flat" className="px-[22px] py-5">
        <RolePlayReadyVoicePills />
        <RolePlayReadySpeedField />
      </Card>
    </section>
  );
}
