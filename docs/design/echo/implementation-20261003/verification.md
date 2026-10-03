# Echo Editorial 검증 기록

기준: `ce348887` (최신 main). 작업 브랜치: `feature/design-editorial-20261003`.
통합 PR: https://github.com/Yelihi/echo/pull/136

## 화면과 범위

승인된 19개 시안은 `../2026-10-03-route-concepts/manifest.json`에서 21개 page 경로에 대응한다.
`/`는 홈 리다이렉트, 세션 ID가 없는 두 기존 경로는 공통 404를 사용한다. API 6개는 UI가 없다.
`npm run storybook` → `views/Route Gallery`에서 19개 화면을 확인할 수 있다.
갤러리는 실제 제품 컴포넌트와 샘플 데이터를 사용하며, 실제 계정의 인증·저장을 실행하지 않는다.
홈 갤러리는 위젯 조합을 보여주며 실제 서버 홈은 최근 자료 두 목록과 학습 기록을 별도로 조회한다.

## 검증 결과

| 검사                     | 결과                         |
| ------------------------ | ---------------------------- |
| TypeScript               | 통과                         |
| ESLint                   | 통과                         |
| Jest                     | 112 suites / 359 tests 통과  |
| Storybook (Chromium)     | 69 files / 287 tests 통과    |
| 390px / 834px / 1440px   | 각각 Route Gallery 19개 통과 |
| Next.js production build | 통과                         |
| Storybook static build   | 통과                         |

반응형 검사는 각 화면의 제목 표시, 가로 넘침, 모바일 메뉴 열기·Escape 닫기·포커스 복귀,
axe 접근성 검사를 포함한다. 재현 명령:

```sh
ECHO_VIEWPORT_WIDTH=390 npm run test:storybook -- src/_storybook/views/RouteGallery.stories.tsx
ECHO_VIEWPORT_WIDTH=834 npm run test:storybook -- src/_storybook/views/RouteGallery.stories.tsx
ECHO_VIEWPORT_WIDTH=1440 npm run test:storybook -- src/_storybook/views/RouteGallery.stories.tsx
```

Chrome에서 로그인, 모바일 편집·메뉴, 준비, 홈, 결과를 시각 검토했다.
390px에서 메뉴 Escape 후 트리거 포커스 복귀, 834px에서 문서 폭 일치를 확인했다.
승인 이미지 크기에 가까운 1488px 캡처: [홈](screenshots/home.png), [분석 결과](screenshots/roleplay-result.png).

검증 중 수정한 사항:

- 사용자 정의 `text-body-*`를 색상으로 오인하던 클래스 병합을 수정해 폰트 크기와 전경색을 보존한다. 회귀 테스트 2개 추가.
- 옅은 배경의 선택 메뉴·태그·분석 상태 글자 대비 수정.
- 암기 편집 화면의 기존 고정 높이 제거로 하단 잘림 방지.
- 바뀐 결과 DOM에 맞춰 기존 실패 상태 테스트 갱신. 내용·재생·언어·실패 안내 검증 유지.
- 화면 진입·다이얼로그 애니메이션 완료 전 판정하던 테스트를 상태 기반 대기로 수정.

## 경계와 검증 한계

- OAuth, 실제 마이크 권한·녹음, 원격 TTS, 서버 저장·삭제·분석은 이 작업에서 실계정으로 실행하지 않았다. 기존 계약 및 관련 테스트를 유지한다.
- #114 등 기존 기능 이슈는 별도다. 구현되지 않은 저장 기능에 성공 상태를 추가하지 않는다.
- 시안의 예시 점수·파형·재생 동작을 새 기능으로 만들지 않는다. 로그인 이미지만 별도 생성 자산으로 추가했다.
- 로컬 전체 `npm run format:check`에는 기존 비추적 문서와 `.claude/settings.local.json`의 포맷 경고가 있다. 사용자 파일은 수정하지 않고 추적 파일 전체를 별도로 검사한다.
- Storybook 실행 중 기존 선택적 Dialog description 경고와 Lottie unmount 시 AbortError 로그가 남을 수 있다. 테스트는 통과하며 제품 데이터 오류와 별개다.
- 자동 병합 및 운영 배포는 수행하지 않는다. 이슈는 PR 병합 시 닫히도록 연결했다.
