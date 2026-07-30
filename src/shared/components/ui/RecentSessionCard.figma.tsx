import figma from "@figma/code-connect";

import { RecentSessionCard } from "@/shared/components/ui/RecentSessionCard";
import { SessionStateBadge } from "@/shared/components/ui/SessionStateBadge";

/**
 * Figma: Echo Design System › RecentSessionCard
 *
 * Figma 의 Status 축은 코드에서 status 슬롯입니다 —
 * SessionStateBadge 를 그대로 재사용하기 위함입니다.
 */
figma.connect(RecentSessionCard, "<ECHO_DS>?node-id=31-123", {
  props: {
    title: figma.string("Title"),
    meta: figma.string("Meta"),
    kind: figma.enum("Kind", {
      roleplay: "roleplay",
      memo: "memo",
    }),
    status: figma.enum("Status", {
      done: <SessionStateBadge state="completed" />,
      partial: <SessionStateBadge state="failed" />,
      analyzing: <SessionStateBadge state="inProgress" />,
    }),
  },
  example: ({ title, meta, kind, status }) => (
    <RecentSessionCard kind={kind} title={title} meta={meta} status={status} />
  ),
});
