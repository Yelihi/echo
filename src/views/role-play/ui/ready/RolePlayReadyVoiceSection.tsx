"use client";

import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";

// shared
import { Card, Spinner } from "@/shared/components";
import { SliderField, VoicePill } from "@/shared/components/ui";

// views
import { ROLE_PLAY_READY_VOICE_OPTIONS } from "@/views/role-play/config/const";
import type { RoleplayReadyVoice } from "@/views/role-play/models/interface";
import { useRolePlayReadyStore } from "@/views/role-play/models/stores/rolePlayReadyStore";
import { previewRolePlayReadySpeed } from "@/views/role-play/services/previewRolePlayReadySpeed";
import { stopRolePlayVoicePreview } from "@/views/role-play/services/playRolePlayVoicePreview";
import { selectRolePlayReadyVoice } from "@/views/role-play/services/selectRolePlayReadyVoice";
import { RolePlayReadySectionTitle } from "@/views/role-play/ui/ready/RolePlayReadySectionTitle";

export function RolePlayReadyVoiceSection() {
  const [pendingVoice, setPendingVoice] = useState<RoleplayReadyVoice | null>(null);

  useEffect(() => stopRolePlayVoicePreview, []);

  const runPreview = (voice: RoleplayReadyVoice, preview: () => Promise<void>) => {
    setPendingVoice(voice);
    void preview().finally(() => {
      setPendingVoice((current) => (current === voice ? null : current));
    });
  };

  return (
    <section className="flex flex-col gap-5">
      <RolePlayReadySectionTitle
        title="상대방 음성"
        description="컴퓨터가 읽어줄 목소리와 속도를 골라보세요."
      />
      <Card variant="flat" className="px-5 sm:px-6 py-5">
        <RolePlayReadyVoicePills
          pendingVoice={pendingVoice}
          onSelectVoice={(voice) => runPreview(voice, () => selectRolePlayReadyVoice(voice))}
        />
        <RolePlayReadySpeedField
          onCommit={(speed) => {
            runPreview(useRolePlayReadyStore.getState().settings.voice, () =>
              previewRolePlayReadySpeed(speed),
            );
          }}
        />
      </Card>
    </section>
  );
}

function RolePlayReadyVoicePills({
  pendingVoice,
  onSelectVoice,
}: {
  pendingVoice: RoleplayReadyVoice | null;
  onSelectVoice: (voice: RoleplayReadyVoice) => void;
}) {
  const voice = useRolePlayReadyStore((state) => state.settings.voice);

  return (
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="TTS 목소리 선택">
      {ROLE_PLAY_READY_VOICE_OPTIONS.map((option) => (
        <VoicePill
          key={option.value}
          role="radio"
          aria-checked={voice === option.value}
          aria-busy={pendingVoice === option.value}
          selected={voice === option.value}
          className="min-h-28"
          icon={
            pendingVoice === option.value ? (
              <Spinner size="sm" className="text-current" aria-hidden="true" />
            ) : (
              <Volume2 />
            )
          }
          label={option.label}
          sub={option.sub}
          onClick={() => onSelectVoice(option.value)}
        />
      ))}
    </div>
  );
}

function RolePlayReadySpeedField({ onCommit }: { onCommit: (speed: number) => void }) {
  const speed = useRolePlayReadyStore((state) => state.settings.speed);
  const setSpeed = useRolePlayReadyStore((state) => state.setSpeed);

  return (
    <SliderField
      className="mt-[18px]"
      label="말하기 속도"
      valueLabel={`${speed.toFixed(2)}x`}
      min={0.7}
      max={1.3}
      step={0.1}
      value={speed}
      onChange={setSpeed}
      onCommit={onCommit}
      minLabel="천천히"
      midLabel="보통"
      maxLabel="빠르게"
    />
  );
}
