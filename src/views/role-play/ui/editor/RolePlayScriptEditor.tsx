"use client";
import { LoadingState } from "@/shared/components/ui";
import type { RolePlayScriptEditorProps } from "@/views/role-play/models/interface";
import { RolePlayScriptCount } from "./RolePlayScriptCount";
import { RolePlayScriptLines } from "./RolePlayScriptLines";
export function RolePlayScriptEditor({ isPending }: RolePlayScriptEditorProps) {
  return (
    <section
      className="min-w-0 rounded-[14px] border border-practice-panel-line bg-white p-8 shadow-practice-panel max-editor:p-6.5 max-compact:px-4.5 max-compact:py-5.5"
      aria-labelledby="script-title"
    >
      <div className="mb-7 flex items-center justify-between gap-5 max-compact:items-start max-compact:gap-3">
        <h2
          className="text-[19px] font-medium text-practice-body max-compact:text-[17px]"
          id="script-title"
        >
          대화 스크립트
        </h2>
        <RolePlayScriptCount />
      </div>
      {isPending ? (
        <LoadingState
          title="대본을 불러오는 중이에요"
          description="TXT 대화를 두 명의 대사로 정리하고 있어요."
        />
      ) : (
        <RolePlayScriptLines />
      )}
    </section>
  );
}
