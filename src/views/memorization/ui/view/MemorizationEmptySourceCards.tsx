// shared
import { cn } from "@/shared/lib/tailwind/utils";

// views
import { MEMORIZATION_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME } from "@/views/memorization/config/const";

export function MemorizationEmptySourceCards() {
  return (
    <div
      className={cn(
        "flex w-full flex-1 items-center justify-center",
        MEMORIZATION_SOURCE_CARDS_MIN_HEIGHT_CLASSNAME,
      )}
    >
      <p className="text-body-4 text-gray-text">검색 결과가 없습니다.</p>
    </div>
  );
}
