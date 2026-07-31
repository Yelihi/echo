import {
  HOME_INTRO_CARDS,
  HOME_RECENT_SESSIONS,
  HOME_SOURCE_SECTIONS,
} from "@/views/home/config/mock";
import { SessionSimplified } from "@/widgets/latest-sessions/ui/SessionSimplified";
import { ListContainer } from "@/widgets/latest-sources/ui/ListContainer";
import { SourceItem } from "@/widgets/latest-sources/ui/SourceItem";
import { SessionIntroCard } from "@/widgets/session-intro-card/ui/SessionIntroCard";

/**
 * 홈 화면.
 */
export function HomeView() {
  return (
    <section className="flex w-full flex-col items-start gap-8">
      <header className="flex flex-col items-start gap-1.5">
        <h1 className="text-heading-md font-bold text-black-primary">
          오늘도 한 문장씩 말해볼까요?
        </h1>
        <p className="text-body-4 text-gray-text">
          롤플레잉으로 대화하고, 긴 문장은 암기로 다져요.
        </p>
      </header>

      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        {HOME_INTRO_CARDS.map((card) => (
          <SessionIntroCard key={card.type} {...card} />
        ))}
      </div>

      <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
        {HOME_SOURCE_SECTIONS.map((section) => (
          <ListContainer
            key={section.type}
            icon={section.icon}
            title={section.title}
            type={section.type}
          >
            {section.items.map((item) => (
              <SourceItem key={`${item.type}-${item.title}`} {...item} />
            ))}
          </ListContainer>
        ))}
      </div>

      <section className="flex w-full flex-col gap-3" aria-labelledby="recent-sessions-title">
        <h2 id="recent-sessions-title" className="text-heading-xs font-bold text-black-primary">
          최근 학습 기록
        </h2>
        <div className="flex w-full flex-col gap-2.5">
          {HOME_RECENT_SESSIONS.map((session) => (
            <SessionSimplified key={`${session.sessionType}-${session.title}`} {...session} />
          ))}
        </div>
      </section>
    </section>
  );
}
