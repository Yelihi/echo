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

## #151 분석 단계 책임 분리 — 2026-10-06

`analyzeGrammar`는 입력 → 사전 체크 → 분석의 순서와 사전 체크 미통과 시 반환만 담당한다. 공개 입력/결과 계약과 server action 호출부는 유지한다.

- `parseGrammarSource`: 필수 입력과 revision 검증. 원문은 보존하며 실패 시 AI 요청을 시작하지 않는다.
- `precheckGrammarSource`: 요청 한도 확인, 사전 체크 호출, 공급자 DTO와 도메인 안내 문구 검증을 담당한다. 통과와 수정 사항이 동시에 있는 응답은 거절한다.
- `generateGrammarAnalysis`: 요청 한도 확인, 분석 호출, 공급자 DTO 검증, 서버 소유 필드 부여, 최종 도메인 검증을 담당한다.
- `consumeGrammarAnalysisRequest`: 두 AI 호출에서 동일한 권한/한도 오류 매핑을 재사용한다.
- 예외는 기존 `requestGrammarAnalysis` 경계까지 전파하며 내부 로깅과 UI용 안전한 오류 변환 위치를 바꾸지 않는다.

단계 내부의 schema가 바뀌면 해당 단계에서 수정한다. 새로운 업무 단계를 추가할 때 실행 순서를 오케스트레이터에 연결하는 변경은 의도적으로 남긴다. 현재 고정 순서와 조기 반환은 이름 있는 함수와 `await`로 충분히 표현되므로 별도 체이닝 클래스나 범용 파이프라인은 도입하지 않았다.

기존 15개 테스트를 먼저 통과시키고, 리팩터링 전에 비동기 순서·사전 체크 검증·provider/한도 오류 전파 회귀 테스트를 추가해 기존 동작을 확인했다. 최종 기능 테스트 29개와 전체 Jest 123 suites / 459 tests, TypeScript·변경 범위 ESLint·Next.js production build를 통과했다. 빌드는 작업 폴더 밖을 가리키는 node_modules 심볼릭 링크로 최초 실패했으며, 해당 폴더에 npm ci로 잠금 파일 그대로 설치한 후 통과했다. 실제 AI 호출은 하지 않았으며 UI 변경이 없어 Storybook 추가 대상은 없다. FS 기록 도구가 제공되지 않아 검토 근거는 이 문서와 로컬 테스트 결과에 남긴다.
