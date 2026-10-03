Echo의 로그인부터 연습·분석·기록까지 승인된 Editorial 디자인으로 통일합니다. 데스크톱 상단 메뉴를 240px 사이드바로 바꾸고, 1024px 미만에서는 키보드로 조작할 수 있는 메뉴 서랍을 제공합니다. 준비·녹음 화면은 독립된 집중 화면입니다.

- Inter/Noto Sans KR, 흰색·레드 테마, 낮은 반경과 구분선 적용
- 자료 목록 두 열, 편집·설정 반응형, 원문과 인식 문장의 행 기반 결과 화면
- 기존 인증·저장·녹음·분석 계약 보존, 실제 기능이 없는 시안 요소 제외
- 19개 화면의 Storybook Route Gallery와 승인 이미지 기록

작업은 #128 → #129 → #130 → #131 → #132 → #133 → #134 → #135 순서로 분리했습니다. 총괄 #29.

검증: 타입·린트 통과, Jest 359개·Storybook 287개 통과, 390/834/1440px에서 각각 19개 화면·접근성 검사 통과, Next.js·Storybook 빌드 통과. 추적 파일 전체 포맷 검사 완료.

실제 OAuth·마이크·원격 저장은 이번 디자인 검증에서 실행하지 않았습니다. 기존 기능 이슈 #114 등은 별도입니다. 운영 배포와 자동 병합은 포함하지 않습니다.

검증 상세: `docs/design/echo/implementation-20261003/verification.md`. 미리보기: `npm run storybook` → `views/Route Gallery` (19개 화면).

Closes #128
Closes #129
Closes #130
Closes #131
Closes #132
Closes #133
Closes #134
Closes #135
