// shared
import { cn } from "@/shared/lib/tailwind/utils";

// views
import { ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME } from "@/views/role-play/config/const";

export function RolePlayEmptySourceCards() {
  return (
    <div
      className={cn(
        "flex w-full flex-1 items-center justify-center",
        ROLE_PLAY_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME,
      )}
    >
      <p className="text-body-4 text-gray-text">검색 결과가 없습니다.</p>
    </div>
  );
}
