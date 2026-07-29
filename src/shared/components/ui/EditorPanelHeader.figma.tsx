import figma from "@figma/code-connect";

import { EditorPanelHeader } from "@/shared/components/ui/EditorPanelHeader";

/**
 * Figma: Echo Design System › EditorPanelHeader
 * Figma 의 Count 는 코드에서 meta 슬롯입니다(문구를 강제하지 않기 위함).
 */
figma.connect(EditorPanelHeader, "<ECHO_DS>?node-id=70-39", {
  props: {
    title: figma.string("Title"),
    meta: figma.string("Count"),
  },
  example: ({ title, meta }) => <EditorPanelHeader title={title} meta={meta} />,
});
