# PR #144 리뷰 후속 반영

## 댓글별 반영

- [홈 상수 파일](https://github.com/Yelihi/echo/pull/144#discussion_r4176204723): `config/practiceModes.ts` → `config/const.ts`. 목록 헤더 설정과 두 편집기의 빈 초깃값도 각 slice의 `const.ts`로 이동.
- [캐러셀 크기/이벤트](https://github.com/Yelihi/echo/pull/144#discussion_r4176207181): 143줄 캐러셀을 선택 상태 조합(38줄), 사진/스와이프(52줄), 이전/다음(32줄), 설명/시작 링크(31줄), 모드 선택(23줄)로 분리. 키보드와 스와이프는 UI 전용이며 UI에 남긴다. 새로운 전역 store는 없다. 홈의 정적 제목은 서버 컴포넌트다.
- [암기 모델 파일](https://github.com/Yelihi/echo/pull/144#discussion_r4176208273): `models/editor.ts`는 런타임 상수가 아닌 타입만 담고 있어 기존 `models/interface.ts`로 통합. 실제 `MEMORIZATION_EDITOR_EMPTY_DRAFT`는 converter에서 `config/const.ts`로 이동.
- [기존 입력 컴포넌트](https://github.com/Yelihi/echo/pull/144#discussion_r4176218425): 기존 Input/Textarea/TagInput의 JSX를 공통 디자인으로 변경. 편집기의 긴 입력/태그 스타일 덮어쓰기를 제거하고 높이·줄 수 등 해당 사용부의 차이만 남김. 오류/비활성/입력/한글 조합/태그 중복 방지와 삭제 계약 유지.

## 순서와 렌더링 검증

1. props/interface 및 상수 경로를 먼저 정의했다.
2. 공용 입력과 독립 캐러셀/모바일 메뉴/행 컴포넌트를 만들었다. 이 단계에서는 HomeView, EditorialShell, 편집기의 기존 조합을 교체하지 않았다.
3. 독립 Storybook 6파일 21개, 유닛 4파일 8개, 타입 검사 통과 후 페이지 사용부를 연결했다.
4. 기존 편집기/홈/셸 Storybook 및 전체 회귀 검사를 실행했다. 실제 대본 편집기 조합에도 행 렌더 측정 회귀 1개를 추가했다.

React Profiler 및 실제 컴포넌트 렌더 호출 측정 결과:

| 이벤트                  | 필요한 갱신             | 갱신되지 않은 영역              |
| ----------------------- | ----------------------- | ------------------------------- |
| 빈 대사 → 유효한 대사   | 편집한 행 1회, 개수 1회 | 다른 대사 행 0회                |
| 유효한 대사의 글자 추가 | 편집한 행 1회           | 다른 행·개수 0회                |
| 자료 제목 변경          | 제목을 구독한 필드      | 대사 행 0회                     |
| 문단 1 수정             | 문단 1만                | 문단 2는 0회                    |
| 문단 확정               | 두 문단의 읽기 상태     | 필요한 갱신이므로 차단하지 않음 |
| 모바일 메뉴 열기/닫기   | 메뉴 자체의 state       | 주변 콘텐츠 0회                 |

대사 개수 구독은 `RolePlayScriptCount`, ID 목록 구독은 `RolePlayScriptLines`, 개별 대사 구독은 `RolePlayScriptLine`로 분리했다. 헤더는 이벤트에서만 사용하는 `edited` 값을 구독하지 않고 취소 시 `getState()`로 읽는다. 167줄 셸은 80줄 조합으로 줄였으며 모바일 메뉴 상태는 `PracticeMobileMenu`가 소유한다.

## 회귀 범위

- 공용 입력을 바꾸었으므로 일부 스토리만이 아니라 전체 Storybook 72파일/286개를 실행했다.
- 녹음 화면 두 스토리는 애니메이션 시작 직후 가시성을 단정하던 테스트를 `waitFor`로 보완했다. 제품의 녹음/분석 로직은 수정하지 않았다. 두 스토리를 포함한 전체 Storybook 통과.
- 전체 Jest 118파일/393개, 타입 검사, ESLint, Next production build 및 Git 추적 파일 포맷 검사를 통과했다. CI 결과는 PR 검증 항목에 기록한다.
- 데스크톱 홈/두 편집기, 모바일 편집기/메뉴를 실제 브라우저에서 확인했다. 1440px/390px에서 가로 넘침 없음. 입력 글자 크기·높이·패딩 유지.
- 원격 DB/OAuth/실제 AI/마이크 E2E는 실행하지 않았다. UI 테스트의 외부 경계 mock과 실제 앱의 repository/Server Action 분리는 유지한다.

이후 작업 순서의 기준은 `docs/design-system.md`에도 기록했다.
