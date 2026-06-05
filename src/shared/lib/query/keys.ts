import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { todoKeys } from "@/features/filter-todos";

// 앱 전체 쿼리 키를 한 곳에서 관리합니다.
// 새 feature의 query-keys를 추가하면 자동으로 병합됩니다.
export const queryKeys = mergeQueryKeys(todoKeys);
