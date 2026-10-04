# 승인된 Practice Hub 실제 앱 반영

2026-10-04 사용자 승인: 미리보기대로 구현하되 기존 아키텍처와 Next.js 구조 유지. 미리보기 기반 `b79bcd7`을 보존하고 아래 이슈를 생성한 뒤 순서대로 보완했다. 기준 main은 `e2122ab`, 작업 브랜치는 `feature/practice-hub-20261004`.

| 순서 | 이슈                                              | 구현과 검토                                                                       | 커밋           |
| ---- | ------------------------------------------------- | --------------------------------------------------------------------------------- | -------------- |
| 1    | [#137](https://github.com/Yelihi/echo/issues/137) | 실제 Next pathname과 preview 라우트 분리, route model 및 11개 경계 검증           | e3d0c22        |
| 2    | [#138](https://github.com/Yelihi/echo/issues/138) | 정적 HomeView + client 캐러셀, transient touch ref, touch cancel                  | c61c966        |
| 3    | [#139](https://github.com/Yelihi/echo/issues/139) | server-only 마이페이지 조회, 자료/학습 변경 성공 후 갱신, 저장·삭제 회귀 16개     | c27b79b        |
| 4    | [#140](https://github.com/Yelihi/echo/issues/140) | widget의 데이터 props와 view별 문구·링크 config 분리, 서버 필터/페이지네이션 유지 | d5babe6        |
| 5    | [#141](https://github.com/Yelihi/echo/issues/141) | 롤플레잉 작성/수정 모델 계약 정리, 무효 저장 차단·실패 복구 UI 검증               | 73a2178        |
| 6    | [#142](https://github.com/Yelihi/echo/issues/142) | 문단 암기 모델 계약 정리, 제안·검수·확정·저장 복구 UI 검증                        | 9b7691c        |
| 7    | [#143](https://github.com/Yelihi/echo/issues/143) | 셸 widget 통합, 계정 메뉴 feature 이동, proxy 가드 및 최종 검증                   | 통합 전달 커밋 |

구현/로컬 검증 완료. 이슈는 PR 병합 시 닫도록 연결하며 main 병합·배포는 이 작업에 포함하지 않는다.

## 유지한 구조

- app: 라우트/인증 layout/오류 경계. 서버에서 읽은 view를 client 셸 children으로 전달한다.
- views/home: 정적 제목은 서버, 사용자 조작이 있는 캐러셀만 client. `next/image`/`next/link`, 두 실제 모드만 사용한다.
- views/my-page: 기존 repository 조회를 server-only service에서 수행, UI에는 DTO와 ReactNode 전달. 각 Suspense 영역의 로딩 및 빈 상태, 페이지 재시도 유지.
- widgets/app-shell: pathname에 따른 표시 결정과 공유 셸. 이전 별도 editorial-shell slice를 흡수하여 같은 레이어 간 의존을 제거.
- features/logout: 계정 메뉴와 기존 logout hook. navigation/app-shell은 이 feature를 재사용.
- widgets/material-library: 모드에 대한 판단 없이 props를 렌더링. view/config가 문구·경로를 소유.
- 편집기: 기존 Zustand store, Zod/Server Action, TXT/문단 제안 feature 유지. 모델 계약은 각 view/models.
- shared: 도메인 조회나 상위 레이어 import 없이 입력/버튼/Tailwind 스타일 담당.

새로운 계층·라이브러리·DB 변경이나 새 연습 기능은 추가하지 않았다. 캐시 갱신은 성공한 작업 뒤에만 실행하며 서버에서 진행하는 비동기 분석 완료를 실시간 구독하는 기능은 추가하지 않았다.

## 검증

- `npm run typecheck`, `npm run lint`, `npm run build`.
- Git 추적 파일 대상으로 Prettier 검사. 사용자의 무관한 untracked 문서는 변경하지 않았다.
- `npm test -- --runInBand`: 112 suites / 376 tests.
- 관련 Storybook 4 files / 23 tests: PracticeHub, PageDesign, AppShell, NavigationContainer. 접근성 검사 포함.
- 기존 route/query/store tests 유지. 새 테스트는 라우트 분기, 변경 후 갱신, 실패·잘못된 입력 방지에 집중.
- 구조 변경 후 데스크톱 홈/모바일 작성 캡처 확인. 시각 기준은 승인된 2026-10-04 미리보기.

원격 OAuth/DB 쓰기/실제 AI·녹음 분석 E2E는 실행하지 않았다. UI 테스트는 외부 저장/AI 경계를 mock하며 앱 경로에서 mock을 사용하지 않는다. Next.js 라우트와 서버·클라이언트 번들 빌드가 성공함을 확인했다.

참고한 규범: 로컬 clean-architecture/FSD, vercel-react-best-practices, frontend-test-principles. FS workflow 전용 MCP가 이 세션에 없어 별도 check ID/승인 해시를 주장하지 않고 GitHub 이슈·커밋과 로컬 검증으로 기록했다.

Next.js 공식 참고: [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath).

## Tailwind 통일 (사용자 후속 요청)

- 프로젝트의 CSS Modules 5개를 제거했다. 셸, 홈 캐러셀, 자료 목록 헤더, 마이페이지는 컴포넌트의 Tailwind utilities로 표현한다.
- 두 편집기의 반복 스타일은 `shared/components/editor/styles.ts`의 정적 Tailwind 클래스 묶음을 공유한다. Input/Textarea에는 `className`으로 전달하며 기존 `cn` 병합을 이용한다. TagInputField에도 `className` 전달을 지원한다.
- 색상·얕은 그림자·진입 모션과 compact/editor 반응형 기준은 `global.css`의 Tailwind `@theme`에 등록했다. 기존 공용 토큰은 유지하고, 붉은 brand 값은 practice 셸 안에서만 지정한다. 페이지별 CSS 선택자나 `@apply`로 Modules를 재생성하지 않았다.
- 편집기의 `!important` 스타일 덮어쓰기를 제거했다. 기존 전역 reduced-motion 접근성 규칙은 유지한다.
- 데스크톱 홈·롤플레잉 편집기 전후 캡처의 크기 및 입력 글자 크기/높이/패딩이 동일했다. 모바일(390px)·태블릿(834px) 배치, 두 편집기, 마이페이지, 메뉴 활성 표시와 모바일 메뉴를 확인했다.
- TypeScript, ESLint, Next production build, Jest 112 suites / 376 tests, 관련 Storybook 4 files / 23 tests 통과. 기능·서버/클라이언트 경계 변경 없음.
