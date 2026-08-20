import { MessageSquare } from "lucide-react";

import { convertFormatDate } from "@/widgets/latest-sessions/config/convertFortmatDate";
import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";
import {
  SOURCE_ITEM_SKELETON_COUNT,
  SourceItem,
  SourceItemSkeleton,
} from "@/widgets/latest-sources/ui/SourceItem";
import { HOME_LATEST_SESSION_LIMIT } from "@/views/home/config/const";
import { getLatestRoleplaySessions } from "@/views/home/services/getLatestSessions";

export async function HomeRoleplaySessionLatestList() {
  const sessions = await getLatestRoleplaySessions({
    page: 1,
    limit: HOME_LATEST_SESSION_LIMIT,
  });

  return (
    <ListContainer
      type="role-play"
      icon={MessageSquare}
      title="최근 롤플레이"
      empty={{
        title: "아직 롤플레이가 없어요",
        description: "대화를 시작하면 여기에 나타나요.",
      }}
    >
      {sessions.map((session) => (
        <SourceItem
          key={session.id}
          icon={MessageSquare}
          type="role-play"
          title={session.materialTitleSnapshot}
          subTitle={`문장 ${session.lineSnapshots.length}개 · ${convertFormatDate(session.updatedAt)}`}
        />
      ))}
    </ListContainer>
  );
}

export function HomeRoleplaySessionLatestListFallback() {
  return (
    <ListContainer type="role-play" icon={MessageSquare} title="최근 롤플레이">
      {Array.from({ length: SOURCE_ITEM_SKELETON_COUNT }, (_, index) => (
        <SourceItemSkeleton key={index} />
      ))}
    </ListContainer>
  );
}
