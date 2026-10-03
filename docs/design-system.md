# Echo · Silver & Ink

첨부된 AuraVox / SwiftBook 이미지의 시각 언어를 Echo의 연습 화면에 적용한다.
색상·타이포·반경의 기준은 `src/app/global.css`, 확인 화면은 Storybook의
`foundations/Design System`이다. 기존 Figma 파일은 과거 버전 참고 자료다.
OpenDesign은 사용하지 않는다.

## 참고 이미지 분석

- 이미지 1·8: 큰 제목과 시각 요소를 비대칭으로 배치하고 넓은 여백으로 구분한다.
  제품 렌더·호텔 사진·과장된 수치는 가져오지 않는다. Echo의 연습 내용이 중심이다.
- 이미지 2·5: 단순한 다열 카드, 약한 회색 면, 큰 카드 반경, 명확한 제목 위계.
- 이미지 3·4: 얇은 구분선, 단정한 입력 영역, 큰 제목과 작은 설명의 대비.
- 이미지 6: 굵은 산세리프 제목과 Regular 본문. 한글 지원과 일관성을 위해 기존
  Noto Sans KR을 유지한다. SF Pro를 별도 다운로드하거나 배포하지 않는다.
- 이미지 7: Paper `#FFFFFF`, Mist `#F9F9F9`, Silver `#B6BEC6`, Ink `#1E1D1D`.
  검은 보드 배경은 프레젠테이션 표현이며 앱 전체 다크 모드로 해석하지 않는다.

## 토큰 계약

| 역할           | 토큰 / 값                                           | 사용                                       |
| -------------- | --------------------------------------------------- | ------------------------------------------ |
| 주요 동작·잉크 | `brand`, `on-brand`, `brand-hover`                  | 차콜 배경 / 흰 글자                        |
| 큰 중립 면     | `silver`                                            | 장식, 히어로 배경. 흰색 작은 글자 금지     |
| 기본 면        | `card-surface`, `gray-background`                   | 흰 카드 / Mist 앱 배경                     |
| 본문·보조      | `black-primary`, `gray-text`, `gray-text-secondary` | #1E1D1D / #595959 / #666666                |
| 컨트롤 경계    | `control-line`                                      | #89949E; 입력·outline 컨트롤에 사용        |
| 장식 구분선    | `card-line`, `card-line-strong`                     | 콘텐츠 구분용, 입력 경계와 구분            |
| 강조 제목      | `text-display`                                      | 40–72px 반응형 / 1.12 / -0.045em / Bold    |
| 일반 제목·본문 | 기존 `heading-*`, `body-*`                          | 밀도 높은 화면의 기존 크기 유지            |
| 반경           | `control`, `panel`, `card`, `hero`, `pill`          | 12 / 20 / 28 / 36 / 9999px                 |
| 여백           | 기본 4px 단위, `page-gutter`, `section`             | 20–64px 좌우 / 40–80px 섹션                |
| 최대 폭        | `max-w-page`                                        | 1200px                                     |
| 모션           | 기본 180ms, 로그인 파동 3.6s                        | 안쪽부터 0.6s 간격; reduced-motion 시 정지 |

`blue-*`, `deep-blue-*`, `rp-*`, `mem-*`은 단계적 이행을 위한 호환 이름이다.
두 필라 모두 동일한 Steel 램프를 사용한다. 신규 코드에는 역할 기반 토큰을 우선한다.
오류·성공·경고의 의미 색상은 유지한다. 기존 컴포넌트의 props와 상태 모델도 유지한다.

## 이후 컴포넌트 적용 기준

| 계층              | 대상                           | 스타일·상태 기준                                                |
| ----------------- | ------------------------------ | --------------------------------------------------------------- |
| shared atomics    | Button, TagChip, Badge         | pill, 기본 차콜, outline 얇은 경계, 선택 상태 명시              |
| shared atomics    | Input, Textarea                | control 반경, 읽을 수 있는 placeholder, focus 경계, 오류 메시지 |
| shared composites | 필터, 카드, 에디터, 다이얼로그 | 카드 면·선 중심, 그림자는 떠 있는 요소에 제한                   |
| widgets           | 셸, 내비게이션, 세션 카드      | 충분한 여백, 주요 동작 1개, 필라 구분은 이름과 아이콘           |
| views             | 페이지 구성                    | 큰 제목은 소개 영역에 제한, 실제 연습 화면의 정보 밀도 유지     |

각 단계에서 기본·hover·focus·선택·disabled·error 상태를 기존 API로 표현한다.
모바일은 한 열, 넓은 화면은 내용에 따라 두세 열. Tailwind 기본 breakpoint를 유지한다.
일반 텍스트 대비 4.5:1, 컨트롤 경계·포커스 대비 3:1을 기준으로 확인한다.
키보드 조작·이름·폼 라벨·모션 감소 설정을 유지한다. 다크 모드는 이번 범위에 없다.

## 단계 및 검증

1. 완료: 토큰, 폰트 적용 일치, Storybook 테마와 foundations.
2. 완료: shared 컴포넌트별 형태·상태 변경 및 stories 업데이트.
   `shared/Silver & Ink`에서 입력·선택·재생·다이얼로그·카드·에디터 조합을 확인한다.
   버튼 높이는 xs 28 / sm 36 / 기본 44 / lg 48px. 위험 동작 텍스트는 `danger-ink`를 사용한다.
3. 완료: widgets UI 및 stories 업데이트. `widgets/app-shell/ui/AppShell/Overview`에서 조합 확인.
4. 완료: views의 페이지 제목·패널·연습 설정·녹음 UI 및 테스트 업데이트.
   `views/Page Design`에서 로그인, 두 편집기, 두 연습 설정, 녹음 관리를 확인한다.

토큰 변경은 기존 소비자에도 반영되므로, foundations와 shared stories를 함께 검증한다.
서버 데이터 요청과 저장·인증·녹음 처리는 기존 경계를 유지한다.

### 위젯 단계 검증 및 Storybook 설정

- App Router를 기본 preview 컨텍스트로 적용한다.
- `useLogout`만 Storybook 모듈 대역으로 처리해 실제 계정과 Supabase 환경변수에 의존하지 않는다.
- 이전에 실패한 위젯·뷰 9개 스토리의 설정 오류를 해결했다.
- 내비게이션 링크의 중첩 버튼 제거, 메뉴 이름·열림 상태 및 Escape 포커스 복귀를 검증한다.
- 연습 시작 경로, 자료 메뉴 콜백, 대사 편집 콜백을 실제 컴포넌트의 stories에서 검증한다.
- 성공 상태 텍스트의 대비를 위해 green-700을 #16713B로 조정했다.
- 녹음 미리보기 두 스토리는 다이얼로그 진입 애니메이션이 끝난 뒤 표시 여부를 확인한다.

### 페이지 단계 검증

- 홈·자료 목록·학습 기록·녹음 관리에는 반응형 display 제목을 적용한다.
  편집기·학습 결과에는 더 작은 heading 토큰을 사용해 콘텐츠 밀도를 유지한다.
- 로그인 카드의 410px 고정 너비를 제거하고 작은 화면과 짧은 화면에서도 스크롤할 수 있게 한다.
  파동은 안쪽부터 0s·0.6s·1.2s 지연으로 순차 등장·퇴장하며, reduced-motion에서는 정지한다.
- 자료 카드 목록은 1 / 2 / 3열이다. 카드 개수와 무관하게 모바일에서 1865px을 차지하던
  최소 높이를 제거하고 빈 상태는 256px을 사용한다.
- 연습 옵션은 콘텐츠 높이에 맞춰 늘어난다. 녹음 준비 화면도 일반 문서 흐름에서 배치한다.
- 본문 입력에 접근 가능한 이름을 추가하고, 공통 선택 카드가 radio로 사용될 때
  버튼 전용 aria-pressed를 함께 출력하지 않도록 수정했다.
- 새 페이지 stories는 실제 client/presentation 컴포넌트와 샘플 props를 사용한다.
  Google 로그인 경로, 대사 추가·취소 후 보존, 문단 확정, 역할·모드 선택,
  보호된 녹음과 삭제 취소를 검증한다. 실제 OAuth·AI·저장 요청은 이 테스트에서 실행하지 않는다.
- 전체 Storybook 66개 파일 / 258개 테스트, views Jest 32개 suite / 82개 테스트 통과.
  타입 검사, 변경 범위 ESLint, Storybook 정적 빌드 통과.
- 새 여섯 페이지를 1440px·390px에서 확인했으며 가로 넘침이 없다.
  서버에서 데이터를 불러오는 홈·자료 목록의 실제 계정 연결은 별도 앱 확인 범위다.
- 기존 description 없는 다이얼로그 stories의 Radix 경고와 정적 빌드 청크 크기 경고는 남아 있다.

### 앱 모션

- 색상·경계는 240ms, 버튼 press는 0.98배, 클릭 가능한 자료·기록 카드는 hover 시 2px 상승한다.
  hover 진입에 40ms 지연을 두며 press·키보드 포커스는 지연하지 않는다. 카드 hover 효과는 정밀 포인터에만 적용하며 메뉴가 열려 있으면 카드 상승을 멈춘다.
- `PageEnter`는 pathname 변경에 8px/420ms 진입 효과를 재생한다. 검색 파라미터·일반 리렌더에는 재생하지 않는다.
  첫 paint 전에 기존 DOM에 Web Animations API를 적용하므로 children을 key로 재마운트하지 않는다.
  AppShell 본문·로그인·몰입형 세션에 적용하며 헤더는 별도로 유지한다.
- 다이얼로그는 Radix presence를 유지하면서 200ms 등장 / 140ms 퇴장한다.
- 프로필·자료 메뉴는 Motion의 AnimatePresence로 160ms 등장 / 120ms 퇴장한다.
  퇴장 중에는 inert 및 aria-hidden으로 추가 조작을 막고 내부 포커스를 트리거로 돌려준다.
- 모션 감소 설정에서는 공간 이동·확대·진행률 보간을 생략한다. 페이지 진입 중 설정이 바뀌어도 애니메이션을 취소한다.
- `foundations/App Motion`에서 상태 유지, 진행률, 메뉴와 팝업을 확인할 수 있다.
- 검증: 전체 Storybook 259개, Jest 313개, 타입·린트, Next.js 및 Storybook 프로덕션 빌드 통과.
  1440px·390px에서 일반/모션 감소, 메뉴 연속 토글, 팝업 위치와 가로 넘침을 검사했다.
  실제 프로덕션 앱의 callback → login 클라이언트 이동과 보호 경로의 로그인 리다이렉트를 확인했다.
  실제 계정의 녹음·저장 흐름과 느린 서버 응답을 동반한 보호 페이지 이동은 이번 자동 검증에 포함하지 않았다.

### 빈 상태 dotLottie

- 공통 EmptyState, 홈의 빈 목록, 학습 기록 빈 화면은 `EmptyIllustration`을 사용한다. 명시적인 커스텀 아이콘은 유지한다.
- [LottieFiles의 Empty Status](https://lottiefiles.com/free-animation/empty-status-GjWIOf38YR) 고래 애니메이션을 사용한다. 원본 JSON을 dotLottie v2로 압축했으며 그림은 변경하지 않았다.
- `public/animations/empty-status.lottie`와 공식 플레이어 WASM을 자체 호스팅한다. 원본 출처·Lottie Simple License·플레이어 라이선스를 같은 폴더에 보관한다. 플레이어 업그레이드 시 WASM도 함께 갱신한다.
- 160×120 영역에서 0.85배속으로 한 번 재생한다. 모션 감소 시 25번 프레임에 정지하며 실행 중 설정 변경도 반영한다. 캔버스는 장식으로 처리하고 파일 로딩 실패 시에도 안내 문구·동작은 유지한다.
- Storybook도 public을 제공하며 `shared/components/ui/EmptyState`에서 실제 파일 렌더링을 확인한다.

- 이번 조정 검증: 관련 Storybook 13개, 타입·린트, Next.js·Storybook 빌드 통과. 브라우저에서 실제 dotLottie 픽셀 렌더링·재생·실행 중 모션 감소·390px 표시·파일 실패 시 문구 유지를 확인했다.

- Google 로그인 연결 화면은 동일 고래를 반복 재생하며 실버 배경·흰 카드·Echo 워드마크를 사용한다. 인증 로직은 유지하며 `views/callback/AuthCallbackContent`에서 로딩·잘못된 provider 상태를 확인한다. 모션 감소 시 반복 재생도 중지한다.
