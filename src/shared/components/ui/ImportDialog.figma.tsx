import figma from "@figma/code-connect";

import { ImportDialog } from "@/shared/components/ui/ImportDialog";
import { LoadingState } from "@/shared/components/ui/LoadingState";

/**
 * Figma: Echo Design System › ImportDialog
 *
 * Figma 의 Stage 축은 코드에 없습니다 — 단계 판단은 호출자 몫이고
 * 컴포넌트는 헤더/본문/푸터 자리만 제공합니다.
 * 본문에는 LoadingState · ErrorState · 미리보기 목록을 넣습니다.
 */
figma.connect(ImportDialog, "<ECHO_DS>?node-id=72-165", {
  props: {
    filename: figma.string("Filename"),
  },
  example: ({ filename }) => (
    <ImportDialog open title="txt 파일 분석" filename={filename} onOpenChange={() => {}}>
      <LoadingState title="AI가 대화를 살펴보고 있어요" />
    </ImportDialog>
  ),
});
