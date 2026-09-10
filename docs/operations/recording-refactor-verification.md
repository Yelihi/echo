# 녹음 흐름 리팩터링 검증

## 책임 배치

- 녹음 화면의 계약은 `views/recording/models`, 브라우저 수명주기와 이벤트는 `services/hooks`에 둔다.
- 상대방 음성 요청은 `features/roleplay-sessions`, 녹음 저장과 완료는 `features/recording-storage`가 담당한다.
- 대화 순서 규칙은 `entities/roleplay-session`, 홈과 목록의 공통 조회는 `widgets/latest-sessions`가 소유한다.
- 결과 조회는 서버 전용 진입점과 `loadSessionAnalysis`를 사용한다. 결과 페이지 조회는 분석 작업을 생성하지 않는다.
- 서버 전용 모듈은 `server-only`와 ESLint 경계 규칙으로 클라이언트 유입을 방지한다.

## 테스트 유지 기준

속성 존재 여부만 확인하던 암기 store 테스트 하나는 제거했다. 중복 저장, 완료 재시도, 다음 문장 전환, 마지막 상대방 발화, 오디오 해제, 오류 팝업 테스트는 유지한다.

결과 조회 테스트는 거대한 모듈 mock 대신 실제 공통 조회 함수에 좁은 읽기 의존성을 주입한다. 소유권 검사, 미완료 세션 거부, 실패한 분석 조회와 반복 조회를 확인한다.

워커 테스트는 실제 배치 조정 함수를 실행한다. 일부 문장 실패 후에도 다른 문장 저장을 기다리는지와 작업 재대기·완료를 확인한다.

## 실행

```sh
npm test -- --runInBand --silent
npm run typecheck
npm run lint
npm run build
node scripts/check-recording-completion.mjs
node scripts/check-analysis-results.mjs
node scripts/check-recording-database.mjs
```

브라우저 검증은 기본적으로 `http://localhost:6007`의 Storybook을 사용한다. `STORYBOOK_URL`로 변경할 수 있다.

DB 검증은 로컬 Supabase만 허용하며 테스트용 사용자와 세션을 생성하고 정리한다. 동시 저장, 멱등성, 순서 위반, 소유권, 완료 후 변경 금지와 오래된 워커 토큰을 실제 RPC로 확인한다. 원격 DB나 유료 AI를 사용하지 않는다.

## 검증 한계

- 2026-09-10: 전체 Jest 87개 스위트, 283개 테스트와 lint, Next 프로덕션 빌드가 통과했다.
- 로컬 Docker가 응답하지 않아 실제 DB 검증은 완료하지 못했다. Docker 및 로컬 Supabase 실행 후 위 스크립트를 실행해야 한다.
- Deno가 설치되어 있지 않아 Edge Function의 Deno 런타임 타입 검증은 수행하지 못했다. Jest 검증은 이를 대체하지 않는다.
