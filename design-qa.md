# Echo 연습 선택 홈 및 작성 화면 검증 · 2026-10-04

final result: passed

## 범위와 비교 기준

사용자 제공 이미지 3/4의 육각형 사진 + 옆 설명 + 상단 내비게이션, 이미지 2의 여백 있는 흰색 입력 패널, 이미지 5의 절제된 타이포그래피/선형 동작을 Echo에 적용했다. 이전 홈 원본 재현 이후 사용자가 요청한 새로운 화면 구성이다. 원본 웹사이트의 문구/사진/픽셀 복제가 아니다.

검증 대상: 홈 2개 슬라이드, 자료 목록 헤더, 두 종류의 작성/수정 컴포넌트, 마이페이지, 공통 셸. 녹음/분석 화면 자체를 새로 디자인하지 않았다.

캡처: `docs/design/echo/practice-hub-20261004/`의 home.png, home-memorization.png, roleplay-editor.png, memorization-editor.png, my-page.png, mobile-home.png, mobile-editor.png, tablet-home.png.
데스크톱 1440×1000, 모바일 390×844, 태블릿 834×1112 CSS viewport에서 브라우저 full-page 캡처. 이미지 자르기나 화면 비율 변형 없이 확인했다.
Storybook은 실제 HomeView/EditorialShell/에디터/MyPageContent를 사용하며 샘플 자료를 주입한다.

## 발견 사항과 수정

- [P1 해결] 홈의 최근 자료/기록 때문에 연습 선택의 목적이 흐려짐. 두 연습 모드 캐러셀과 상단 내비게이션으로 교체하고 자료/기록을 마이페이지로 이동.
- [P1 해결] 기존 채팅 말풍선 형태의 대본 입력. 기본 정보 2열과 번호/화자/대사 편집 행으로 재구성. 문단 암기는 원문/검수 2열로 재구성.
- [P2 해결] 작은 회색 글자의 대비 부족. 글자 크기/굵기로 위계를 유지하며 설명/라벨 색을 #6e6e6a 등으로 조정. 접근성 자동 검사 통과.
- [P2 해결] 모바일 사진 문구가 3줄로 밀림. 유동 글자 크기를 적용하여 사진 안쪽에 배치.
- [P2 해결] 셸의 브랜드 색 변경이 이전 SessionIntroCard 본문에 전파되어 대비 하락. 본문을 의미에 맞는 black-primary 토큰으로 지정.
- [P3 허용] 참고의 영문 글꼴을 한글 서비스에 그대로 복제하지 않고 기존 Noto Sans KR 및 이미지 위 Arial을 사용. 한국어 제목/설명/버튼의 강약과 줄바꿈을 확인.

## 시각 및 동작 확인

- 홈에서는 사이드바가 없고 모드에 진입하면 나타남. 마이페이지에서도 상단 내비게이션으로 돌아옴.
- 작은 내비게이션(12–14px), 짧은 붉은 활성선, 충분한 터치 영역.
- 사진은 실제 자산이며 육각형은 CSS clip-path. HTML 텍스트를 별도로 표시. generated WebP 두 장 합계 약 305 KiB.
- 데스크톱 사진/설명 정렬, 입력 패널 간격, 본문/라벨 위계, 마이페이지 행 정렬을 직접 캡처로 확인.
- 모바일은 사진 → 설명 순서, 입력 패널 단일 열, 대본 화자/입력 재배치. 모바일/태블릿 document.scrollWidth가 viewport와 같음.
- 이전/다음, 방향키, 모드 직접 선택 지원. 모바일 터치 스와이프 처리, 자동 재생 없음. reduced-motion에서 효과 제거.
- 홈 → 자료 → 작성 → 대사 추가/화자 전환 → 취소 확인 → 마이페이지 → 홈 통과.
- 모바일 메뉴 열기/Escape/포커스 복귀/가로 넘침 검사 통과.
- 실제 자료 조회 로직을 마이페이지로 이동. Suspense 로딩/빈 상태 및 페이지 오류 재시도 제공.

## 코드 검증 및 한계

- TypeScript, ESLint, Next production build 통과.
- Jest 112 suites / 376 tests 통과.
- 관련 Storybook 4 files / 23 tests 통과. 화면 접근성 검사 포함.
- 브라우저 미리보기는 샘플 데이터이며 저장/AI/세션 시작은 mock. 녹음/분석으로 이어지는 링크는 미리보기 범위 안내를 표시한다.
- 실제 OAuth/원격 저장/AI 응답/녹음·분석 E2E는 실행하지 않았다.
- 변경은 feature 브랜치에서 검증했으며 main 병합 및 배포하지 않았다.

## 승인 후 실제 앱 통합 (#137–#143)

- 승인된 사진/색상/배치 변경 없이 HomeView의 정적 부분과 PracticeModeCarousel의 client 경계를 분리했다.
- 셸의 라우트 분류/타입은 기존 app-shell/models, 렌더링은 app-shell/ui로 모았다. 계정 메뉴는 features/logout으로 옮겨 widget 간 의존을 제거했다. 라우트 분류 11개 케이스 검증.
- 공통 자료 헤더는 widget props 계약만 가지며 모드별 문구/경로는 각 view/config에 둔다.
- 마이페이지 조회는 services/server와 server-only를 유지한다. 자료 저장·삭제와 세션 생성/분석 재시도 성공 후 마이페이지 갱신을 연결했다. 새 라우트에 기존 proxy 보호 목록도 적용했다.
- 저장/삭제 Server Action의 성공·실패·비인증 및 수정 ID 보존 테스트 16개 통과.
- 편집기 props는 기존 각 view/models로 이동했다. 롤플레잉 저장 실패 → 입력 보존 → 재시도, 문단 확정 전 저장 차단 → 제안/편집/확정 → 실패/재시도를 실제 UI로 검증했다. 외부 저장/AI 경계만 mock이다.
- 제품 import에서 Storybook fixture/mock으로 이어지는 경로가 없음을 검토했다. 인증은 server layout, 영속화는 기존 repository 및 Server Action이 담당한다. 상태 관리 라이브러리/DB/도메인 계약은 변경하지 않았다.
- 구조 정리 후 `integrated-home.png` (1440px)와 `integrated-mobile-editor.png` (390px)를 재확인했다. 모바일 문서 폭 390px로 가로 넘침 없음.
- 상세 이슈/커밋/제한: `docs/design/echo/practice-hub-20261004/implementation.md`.

## Tailwind 통일 후 재검증

- CSS Modules 5개 및 해당 import를 모두 제거. 공통 편집기 스타일도 Tailwind 정적 클래스이며 CSS 우선순위를 위한 `!important`가 없다.
- 전환 전/후 데스크톱 홈(1440×1000)과 롤플레잉 작성 화면(1440×1149)을 비교했다. RGB 채널 차이 8을 초과하는 픽셀은 각각 약 0.03%로, 차이는 유사한 중성색의 공통 토큰 정리와 포커스 색에 한정된다. 입력 필드는 15px/48px/11px 14px, 대사 입력은 16px/83.59px/12px 16px로 유지됐다.
- 모바일 여백과 반응형 우선순위는 rem 단위의 compact/editor Tailwind breakpoint로 통일했다. 데스크톱·모바일·태블릿에서 가로 넘침과 패널 배치를 확인했다.
- `integrated-home.png`, `integrated-mobile-editor.png`를 Tailwind 적용 화면으로 갱신했다.
- 타입 검사·린트·production build·Jest 376개·관련 Storybook 23개 통과. 원격 서비스 E2E 범위는 위 한계와 동일하다.

## 에디터 스타일 직접 작성 후 확인

- `shared/components/editor/styles.ts`를 제거하고 모든 에디터 스타일을 JSX의 `className`으로 이동했다. 제목·라벨·동작 버튼은 각 요소에 직접 지정한다.
- 공용 버튼의 커스텀 radius 토큰 병합을 수정하고 8개 회귀 테스트를 추가했다.
- 두 편집기의 데스크톱 화면 및 모바일 롤플레잉 작성 화면에서 배치·입력 크기·버튼 모서리를 확인했다.
- 검증: TypeScript/ESLint/Next build, Jest 113 suites / 384 tests, 관련 Storybook 4 files / 23 tests 통과.
