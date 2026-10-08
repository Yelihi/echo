# 어법 연습 구현 순서

2026-10-05 사용자 승인. 각 이슈별 브랜치·PR을 만들며 사용자가 직접 검토·병합한다. 원격 DB 마이그레이션 적용, 배포, 유료 AI 시험 호출은 이 작업에 포함하지 않는다.

## 변경 계약

- 문장 아래 분석 풀이, 사용자 구간 경계·계층 편집.
- 영어 문장·핵심 어법만 필수 입력. AI 제목·태그. 사전 체크 → 분석 → 저장 → 예문 생성.
- 목록 페이지네이션·스켈레톤. 실패 재시도. 저장 문장 음성 재생.
- 수정안의 암기/시험, 새 문맥 작문과 종료 후 답안별 피드백.
- 재연습 순서 변경, 완료 세션 단위 기록, 누적 횟수·날짜.
- Interface → 컴포넌트 → Storybook/유닛 통과 → 페이지 연결. Tailwind/CVA, FSD/Next.js, 작은 상태 구독.

## 이슈와 의존성

| 이슈                                              | 변경 단위                                    | 선행                                     |
| ------------------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| [#149](https://github.com/Yelihi/echo/issues/149) | 어법 노트·분석 구간 계약과 검증              | main                                     |
| [#150](https://github.com/Yelihi/echo/issues/150) | 분석 구간 경계·계층 편집 기능                | #149                                     |
| [#151](https://github.com/Yelihi/echo/issues/151) | 사전 체크·문장 분석 AI 서비스                | #149                                     |
| [#152](https://github.com/Yelihi/echo/issues/152) | 어법 노트 저장·조회 계약과 소유권 보호       | #149                                     |
| [#153](https://github.com/Yelihi/echo/issues/153) | 두 필수 입력·사전 체크·분석 검토 등록 화면   | #150, #151, #152                         |
| [#154](https://github.com/Yelihi/echo/issues/154) | 예문 생성·검토·선택 저장과 다시 생성         | #151, #152                               |
| [#155](https://github.com/Yelihi/echo/issues/155) | 어법 목록 페이지네이션·검색·스켈레톤         | #152                                     |
| [#156](https://github.com/Yelihi/echo/issues/156) | 저장 기준 문장·채택 예문 TTS 준비와 재생     | #152                                     |
| [#157](https://github.com/Yelihi/echo/issues/157) | 연습 세션·무작위 순서·완료 기록 계약         | #149, #152                               |
| [#158](https://github.com/Yelihi/echo/issues/158) | 부분 완성·전체 회상 암기 UI                  | #157                                     |
| [#159](https://github.com/Yelihi/echo/issues/159) | 기존 예문·새 문맥 작문 시험과 종료 후 피드백 | #157, #151                               |
| [#160](https://github.com/Yelihi/echo/issues/160) | 노트별 누적 횟수·연습 날짜·기록 상세         | #157                                     |
| [#161](https://github.com/Yelihi/echo/issues/161) | 홈·상세·연습·결과 라우트 연결과 회귀         | #153, #154, #155, #156, #158, #159, #160 |

## 검증

`npm run typecheck`, 변경 범위 ESLint, 해당 Jest 테스트. UI는 독립 Storybook 테스트 후 연결. 마지막 통합에서 전체 Jest/Storybook·빌드·실제 화면을 검증한다. 검증하지 않은 외부 AI/원격 DB는 통과로 표기하지 않는다.

## 기준선

- 시작 브랜치 HEAD 644cca7: TypeScript 통과, Jest 120개 suite / 406개 테스트 통과.
- 최신 origin/main 9149f9f는 PR #144 병합 커밋. 별도 worktree에서 구현.
- 첫 이슈 #149: 새 도메인 테스트 24개 통과. 화면·DB·외부 API 변경 없음.
- FS MCP가 노출되지 않아 로컬 문서와 GitHub issue/PR로 작업 기록을 유지한다.

## #152 저장·조회 구현 기록 — 2026-10-06

브랜치: `feature/152-grammar-note-persistence`, 기준: `main` (`f5bef12`).

- `GrammarNoteRepositoryPort`를 정의하고 Supabase 구현을 추가했다. 소유자는 클라이언트 입력으로 받지 않고 DB의 `auth.uid()`에서 정한다.
- 하나의 노트 content에 기준 문장·메타데이터·분석·예문을 함께 저장한다. 생성은 `(owner_id, creation_request_id)`로 멱등성을 보장한다. 같은 생성 요청을 재시도하면 기존 노트를 반환하고, 같은 키에 다른 내용을 보내면 충돌을 반환한다.
- 최초 생성 content를 별도로 보관하므로 노트 수정 이후의 생성 재시도도 구분한다. 이 중복 저장은 최초 요청과의 정확한 비교를 위한 비용이다. RPC 응답과 목록에는 이 내부 스냅샷을 포함하지 않는다.
- 수정은 행 잠금과 `expectedVersion` 비교 후 한 번에 반영한다. 타 소유자와 없는 노트는 동일한 NOT_FOUND로 처리한다. RLS는 소유자 조회만 허용하고 인증 사용자의 직접 INSERT/UPDATE/DELETE는 막는다.
- 목록은 최신 수정일과 ID 내림차순으로 정렬한다. 제목·기준 문장 검색은 대소문자를 무시하는 문자열 부분 검색이며 `%`, `_`도 문자로 취급한다. 기본 20개, 최대 100개이고 화면에서 pageSize를 지정할 수 있다. 목록과 total은 같은 SQL 스냅샷에서 구하며 빈 페이지에도 total을 반환한다. 분석 전체 대신 요약 필드만 반환한다.
- 입력/DB 응답은 기존 도메인 schema로 검증한다. JSON 변환, DB 오류 매핑, repository의 요청 조합을 분리했다. 오류 코드는 UI가 해석하고 원래 DB 오류는 내부 로깅용 cause에 보존한다. 기능 요청 경계에서 로깅하는 기존 정책을 유지한다.
- SQL은 저장 경계의 필수 구조·텍스트/배열 제한·원문과 revision 일치를 검사한다. UTF-16 구간 경계, 계층·교차 참조·중복 ID 등의 상세 의미 규칙은 TypeScript 도메인 검증 책임이다. 인증 사용자가 직접 RPC를 호출해 이 상세 검증을 우회한 데이터는 Repository의 읽기 검증에서 거절된다. SQL이 TypeScript의 모든 의미 규칙을 보장한다고 간주하지 않는다.
- `database.types.ts`는 새 migration 계약에 맞춰 수동으로 추가했다. 배포 DB에서 생성한 타입이라고 간주하지 않는다.

검증: 전체 Jest 122 suites / 454 tests 통과(새 Repository/직렬화 HTTP 경계 테스트 24개 포함), TypeScript·변경 범위 ESLint·production build 통과. Supabase SDK는 실제 query builder를 사용하며 HTTP 응답만 대체했다. DB의 실제 권한·동시성 보장은 이 단위 테스트의 대상이 아니다.

별도로 PGlite의 임시 PostgreSQL에서 migration을 적용하고 SQL 런타임 검증 59개를 통과했다. `auth.uid`와 pgTAP assertion API를 임시 함수로 대체했으므로 실제 Supabase/pgTAP 통합 결과는 아니다. 다중 세션의 동시 요청도 실행하지 않았다. 원래 pgTAP 테스트는 `supabase/tests/grammar_notes.test.sql`에 보존했다. Docker daemon 및 native PostgreSQL이 없어 실제 Supabase 로컬 DB 검증은 미실행이다. 원격 DB 마이그레이션은 적용하지 않았다.

DB 검증 재현: 로컬 Supabase가 실행되는 환경에서 이 migration을 적용한 다음 `npx supabase test db supabase/tests/grammar_notes.test.sql`. 마이그레이션 적용은 검증용 로컬 DB에서만 수행하며 원격 배포와 구분한다. PGlite 확인용 임시 harness와 로그는 `/tmp/echo-grammar-sql-check/check.mjs`, `/tmp/echo-grammar-sql-check/result.txt`에 있다.

이 PR에는 화면 변경이 없다. 다음 #153에서 입력·사전 체크·분석 수정·저장 UI를 연결한다. #163·#164는 기존 feature 브랜치에만 있고 main에는 아직 없으므로 #153을 시작할 때 선행 변경 포함 여부를 확인한다. FS MCP 기록 도구가 제공되지 않아 실행 근거는 이 문서와 로컬 결과 및 PR에 남긴다.
