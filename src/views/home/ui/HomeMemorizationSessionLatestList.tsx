import { Layers } from "lucide-react";

import type { MemorizationParagraphSnapshot } from "@/entities/memorization-session";
import { convertFormatDate } from "@/widgets/latest-sessions/config/convertFortmatDate";
import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";
import {
  SOURCE_ITEM_SKELETON_COUNT,
  SourceItem,
  SourceItemSkeleton,
} from "@/widgets/latest-sources/ui/SourceItem";
import { HOME_LATEST_SESSION_LIMIT } from "@/views/home/config/const";
import { getLatestMemorizationSessions } from "@/views/home/services/getLatestSessions";

export async function HomeMemorizationSessionLatestList() {
  const sessions = await getLatestMemorizationSessions({
    page: 1,
    limit: HOME_LATEST_SESSION_LIMIT,
  });

  return (
    <ListContainer
      type="memorization"
      icon={Layers}
      title="최근 암기"
      empty={{
        title: "아직 암기 세션이 없어요",
        description: "연습을 시작하면 여기에 나타나요.",
      }}
    >
      {sessions.map((session) => (
        <SourceItem
          key={session.id}
          icon={Layers}
          type="memorization"
          title={session.materialTitleSnapshot}
          subTitle={`문장 ${countMemorizationSentences(session.paragraphSnapshots)}개 · ${convertFormatDate(session.updatedAt)}`}
        />
      ))}
    </ListContainer>
  );
}

export function HomeMemorizationSessionLatestListFallback() {
  return (
    <ListContainer type="memorization" icon={Layers} title="최근 암기">
      {Array.from({ length: SOURCE_ITEM_SKELETON_COUNT }, (_, index) => (
        <SourceItemSkeleton key={index} />
      ))}
    </ListContainer>
  );
}

function countMemorizationSentences(paragraphs: ReadonlyArray<MemorizationParagraphSnapshot>) {
  return paragraphs.reduce((total, paragraph) => total + paragraph.sentences.length, 0);
}
