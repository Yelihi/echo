# Echo 연습 선택 홈 · 2026-10-04

사용자 피드백에 따라 승인된 디자인을 실제 앱에 반영한 구현. `feature/practice-hub-20261004` 브랜치이며 main 병합·배포하지 않았다.

## 변경

- 홈: 대시보드에서 두 연습 모드의 사진 슬라이드로 전환. 현재 작동하는 롤플레잉·문단 암기만 표시하며 모드 목록은 `practiceModes.ts`에서 관리.
- 홈/마이페이지: 상단 내비게이션. 연습 모드 내부: 216px 사이드바, 작은 텍스트와 짧은 붉은 활성 표시. 모바일: 모달 메뉴.
- 최근 자료/학습 기록: 기존 조회를 `/my-page`로 이동. 로딩·빈 상태·재시도 제공.
- 롤플레잉 작성: 2열 기본 정보, 번호/화자/대사 순서의 행 편집.
- 문단 암기 작성: 원문 입력/문단 검수 2열 패널, 좁은 화면은 세로 배치.
- 기존 저장·TXT·문단 제안·검수 로직 유지.

## 참고

사용자 제공 2026-10-04 이미지 2(입력 패널), 3(육각형 사진과 옆 설명), 4(상단 내비게이션), 5(절제된 입력/타이포그래피).
https://www.awwwards.com/sites/sequence-website
새 방향에 맞춘 구성 변경이며 이전 홈 시안의 픽셀 복제가 아니다.

## 로컬 미리보기

`npm run storybook -- --no-open`

- http://localhost:6006/iframe.html?id=views-practice-hub--home&viewMode=story
- http://localhost:6006/iframe.html?id=views-practice-hub--roleplay-editor&viewMode=story
- http://localhost:6006/iframe.html?id=views-practice-hub--memorization-editor&viewMode=story
- http://localhost:6006/iframe.html?id=views-practice-hub--my-page&viewMode=story

실제 UI 컴포넌트를 사용하는 샘플 데이터 미리보기다. 홈 → 목록 → 작성 → 마이페이지 탐색을 지원한다. 저장/AI 제안/세션 시작은 mock이며 서버에 쓰지 않는다. 녹음·결과 링크에서는 미리보기 범위를 알리는 안내를 표시한다. 실제 앱은 기존 서버 동작과 로그인한 사용자 데이터를 사용한다.

## 사진 자산

내장 `image_gen`으로 생성한 원본을 Sharp로 WebP 1200×1200, quality 85로 압축했다. UI 텍스트는 이미지에 포함하지 않고 HTML로 렌더링한다.

- `public/images/practice/cafe.webp` (169,548 bytes)
  - Prompt: Original square editorial photograph of a quiet European street corner cafe, open doorway, a small round table with two coffee cups, dark walnut window reflections, natural light and charcoal tones, oxblood chair, centralized subject with corners suitable for hexagon cropping, no people/text/logos, moderately dark for white UI overlay.
  - Generated original: `/Users/yelihi/.codex/generated_images/01a0ffbc-e548-7151-9744-ff31522beec4/exec-7c97ea3e-f261-4a00-978e-c341b8a0085e.png`
- `public/images/practice/reading.webp` (142,480 bytes)
  - Prompt: Original square editorial photograph of a quiet library nook, an open cream book on a dark oak desk, linen chair, tall window and bookshelves, afternoon light, taupe/charcoal and a red bookmark, corners suitable for cropping, no people/readable text/logos, dark central area for white UI overlay.
  - Generated original: `/Users/yelihi/.codex/generated_images/01a0ffbc-e548-7151-9744-ff31522beec4/exec-ed8fc547-cb86-4c60-87de-621bea6a6abf.png`

검증 상세: 프로젝트 루트 `design-qa.md`.

승인 이후 이슈별 구현 및 검증: [implementation.md](./implementation.md).
