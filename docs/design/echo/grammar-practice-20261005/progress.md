# 어법 연습 이슈별 구현 현황

2026-10-05. 사용자가 각 최소 단위 PR을 직접 검토·병합하는 흐름이다. 아래는 첫 검토분이며 전체 어법 기능 완료 기록이 아니다. 원래 작업 폴더의 다른 문서는 변경하지 않았다.

| 이슈                | 브랜치                            | PR                                      | 상태                                               |
| ------------------- | --------------------------------- | --------------------------------------- | -------------------------------------------------- |
| #149 데이터 계약    | feature/149-grammar-domain        | https://github.com/Yelihi/echo/pull/162 | 구현·검증 완료, 사용자 검토/병합 대기              |
| #150 분석 편집      | feature/150-grammar-analysis-edit | https://github.com/Yelihi/echo/pull/163 | 독립 UI·Storybook 검증 완료, 사용자 검토/병합 대기 |
| #151 사전 체크/분석 | feature/151-grammar-analysis      | https://github.com/Yelihi/echo/pull/164 | 서비스·실패 경로 검증 완료, 사용자 검토/병합 대기  |
| #152–#161           | 아직 없음                         | 아직 없음                               | 등록 완료, 미구현                                  |

## 검토 순서

#162는 main 기반이다. #163과 #164는 서로 독립적이며 #162 브랜치 기반이다. #162 병합 후 main으로 base를 바꾸고 변경 범위를 다시 확인한다. 자동 병합하지 않는다. 기존 workflow가 main 대상 PR만 실행하는 경우 stacked PR의 로컬 검증과 원격 CI를 구분한다.

## 검증 근거

- #149: cdd79ef, 도메인 Jest 24개·타입·변경 ESLint 통과. GitHub verify run 37255887613 통과.
- #150: 48491ff, 전체 Jest 123 suites / 446 tests, 독립 Chromium Storybook 5개, 타입·변경 ESLint·Next.js build 통과. 실제 Storybook 화면 1365px와 390px 확인, 모바일 가로 넘침 없음.
- #151: 4a9de80, 전체 Jest 123 suites / 445 tests (새 서비스/controller 15개 포함), 타입·변경 ESLint 통과.
- 유료 AI 호출, 원격 DB 배포, 실사용 인증 계정의 통합 흐름은 미실행. 제품 페이지 연결 전이다.

재현: 각 브랜치에서 `npm ci`, `npm run typecheck`, `npm test -- --runInBand`. 편집기 Storybook은 `npm run test:storybook -- src/_storybook/features/grammar-analysis-edit/GrammarAnalysisEditor.stories.tsx`. 화면은 `npm run storybook`으로 features/grammar-analysis-edit/GrammarAnalysisEditor를 연다.

## 이어서 할 일

#152 소유권·버전·멱등성·목록 조회 저장 계약부터 진행한다. 로컬 Docker daemon은 현재 응답하지 않아 DB 실행 검증 환경을 먼저 확인해야 한다. DB 적용을 실행한 것으로 간주하지 않는다. 이후 dependency는 implementation-plan.md의 이슈 표를 따른다. #145–#148의 기존 별도 검토 이슈는 이번 작업으로 해결했다고 간주하지 않는다.
