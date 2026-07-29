import * as React from "react";
import { cva } from "class-variance-authority";
import { MessageSquare } from "lucide-react";

import { cn } from "@/shared/lib/tailwind/utils";

export const editorPanelHeaderVariants = cva(
  "group/editor-panel-header flex w-full items-center gap-2 border-b border-card-line bg-card-surface px-4.5 py-3",
);

export interface EditorPanelHeaderProps {
  title: React.ReactNode;
  /** 우측 보조 정보(예: "2개 대사") */
  meta?: React.ReactNode;
  /** 기본 아이콘(MessageSquare)을 바꾸고 싶을 때 */
  icon?: React.ReactNode;
}

/**
 * 에디터 패널 상단 바. 제목과 우측 보조 정보를 보여줍니다.
 */
export const EditorPanelHeader = ({
  className,
  title,
  meta,
  icon = <MessageSquare />,
  ...props
}: EditorPanelHeaderProps & React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="editor-panel-header"
      className={cn(editorPanelHeaderVariants(), className)}
      {...props}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-secondary text-blue-sub-paragraph [&_svg]:size-3.5">
        {icon}
      </span>
      <span className="flex-1 text-body-2 font-bold text-black-primary">{title}</span>
      {meta ? <span className="text-body-1 font-bold text-gray-text-secondary">{meta}</span> : null}
    </div>
  );
};
