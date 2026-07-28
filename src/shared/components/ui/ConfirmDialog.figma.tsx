import figma from "@figma/code-connect";

import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";

/**
 * Figma: Echo Design System › ConfirmDialog
 *
 * Figma 는 Danger 를 boolean 축으로 두지만, 저장소 규칙이 boolean prop 대신
 * variant union 이라 tone 으로 옮깁니다.
 * 열림 상태와 버튼 문구는 호출자가 소유합니다.
 */
figma.connect(ConfirmDialog, "<ECHO_DS>?node-id=38-54", {
  props: {
    title: figma.string("Title"),
    description: figma.string("Body"),
    tone: figma.enum("Danger", {
      true: "danger",
      false: "default",
    }),
  },
  example: ({ title, description, tone }) => (
    <ConfirmDialog
      open
      onOpenChange={() => {}}
      tone={tone}
      title={title}
      description={description}
      confirmLabel="확인"
      cancelLabel="취소"
      onConfirm={() => {}}
    />
  ),
});
