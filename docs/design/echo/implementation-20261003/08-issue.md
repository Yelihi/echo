## 목적

승인된 Echo 디자인을 기존 제품에 적용합니다.

## 작업 범위

21개 페이지 경로·19개 시안 대응, 통합 수정·검증·PR

## 기준 시안

`docs/design/echo/2026-10-03-route-concepts/` — 전체

## 보존할 계약

- 기존 Next.js/FSD, 데이터·인증·저장·분석 계약 유지.
- 전체 반응형: 1024px 미만 메뉴 서랍, 768px 미만 목록 한 열.
- 실제 음성 선택지·상태·접근성을 시안의 샘플보다 우선.
- 신규 기능·API·DB migration·운영 배포 제외. 기존 기능 이슈 유지.

## 완료 조건

- [ ] 390·834·1440px, 접근성·키보드·모션 감소·실패 상태 및 전체 자동 검사
- [ ] 변경 범위 타입·린트·포맷, 관련 Jest/Storybook 검사
- [ ] 시각 검토 및 검증 한계 기록

## 진행

총괄 #29. 순서 8/8. 전용 브랜치에서 순차 커밋 후 통합 PR, 자동 병합·배포 없음.

최종 검사: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test -- --runInBand`, `npm run test:storybook`, `npm run build-storybook`, `npm run build`.

Depends on: #134
