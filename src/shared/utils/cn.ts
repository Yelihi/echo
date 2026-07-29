/**
 * 클래스명을 조합하는 유틸리티 함수
 *
 * 구현은 `@/shared/lib/tailwind/utils` 한 곳에만 둡니다.
 * (components.json 의 `utils` alias 가 해당 경로를 가리키므로 shadcn CLI 와도 일치)
 *
 * 이전에는 단순 join 이라 `className` 으로 기본 클래스를 덮어쓸 수 없었습니다.
 * 이제 clsx + tailwind-merge 를 거치므로 뒤에 오는 클래스가 확정적으로 이깁니다.
 */
export { cn } from "@/shared/lib/tailwind/utils";
