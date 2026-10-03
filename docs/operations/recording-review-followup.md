# PR #106 리뷰 후속 수정

- 평가 모드는 세션 생성 RPC에서 저장하고 작업 생성 시 복사한다. URL로 평가 모드를 덮어쓰지 않는다.
- 기존 세션은 과거 선택을 복구할 수 없어 실제 처리 방식이었던 exact를 유지한다.
- 학습자 문장이 없는 세션은 서버 입력 검증과 DB RPC에서 거부한다.
- completed 작업의 부분 결과에는 재시도 버튼을 표시하지 않는다. failed 작업은 재시도 가능하다.
- 무토큰 완료·실패·재대기 RPC 권한과 직접 분석 결과 insert/update 권한을 회수한다.
- 인증 사용자의 직접 롤플레잉 녹음 쓰기를 RLS로 차단하고, service_role 직접 쓰기도 순서와 오브젝트 존재를 트리거에서 검사한다.

## 배포 주의

후속 migration은 `20260910160000_recording_review_invariants.sql`이다. 이번 리뷰 수정 작업에서는 원격 DB나 Edge Function을 배포하지 않는다.

새 워커를 먼저 배포한 뒤 migration과 앱을 배포한다. 이전 스키마의 작업에 평가 모드가 없으면 새 워커는 exact로 처리하며, migration 이후의 작업부터 저장된 모드를 사용한다.
migration 이후 이전 워커의 결과 저장과 상태 변경은 거부된다. 진행 중인 이전 작업은 새 워커가 stale claim 회수 후 처리하도록 해야 한다.

로컬 DB 테스트 명령: `node scripts/check-recording-database.mjs`.
Docker가 실행되지 않아 실제 RPC 회귀 검증은 별도 실행이 필요하다.

## 수동 출시 워크플로

`Echo Release`는 main의 선택한 커밋에 대해 운영자가 `workflow_dispatch`로 시작한다.
`staging`과 `production` GitHub Environment에 서로 다른 Supabase/Vercel 프로젝트의
시크릿을 설정한다. 두 Vercel 프로젝트 모두 자신의 production 환경으로 배포한다.
워크플로에 필요한 키 이름은 `.github/workflows/deploy.yml`에 있으며 값은 커밋하지 않는다.
분석 worker의 API 키와 PROCESS_ANALYSIS_SECRET은 해당 Supabase 프로젝트에 사전 설정한다.
Vercel Git 연동의 별도 자동 배포는 비활성화해야 이 출시 순서가 유지된다.

1. 동일 커밋의 포맷·린트·타입·Jest·앱 빌드, Storybook 브라우저 검사,
   로컬 Supabase pgTAP/RPC 검사를 모두 통과한다.
2. Vercel 앱을 먼저 빌드하여 빌드 실패 시 DB 변경을 시작하지 않는다.
3. migration dry-run 후 호환 worker를 배포하고 DB migration을 적용한다.
4. worker OPTIONS 응답을 확인한 후 준비된 앱을 게시한다.

단계 실패 시 다음 단계는 실행하지 않는다. OPTIONS는 실행 가능 여부만 확인하며,
인증·실제 녹음·분석 성공을 보장하지 않는다. 배포 후 초대 계정으로 별도 확인한다.
기존 POST smoke test처럼 대기 중 유료 분석 작업을 임의로 소비하지 않는다.

동일 환경 배포는 직렬화한다. migration 적용 후 앱 게시가 실패하면 DB/worker가
앞선 버전인 상태로 남으므로 원인을 수정하고 다시 배포한다. 자동 DB 롤백은 하지 않는다.
앱 롤백 전 DB/worker 호환성을 확인하며, 파괴적 migration은 이 경로에 포함하지 않는다.

로컬 무변경 순서 검사: `node --test scripts/__tests__/deploy-analysis-processor.test.mjs`.
CI의 로컬 DB는 운영 시크릿을 사용하지 않으며, 원격 DB로 대체 실행하지 않는다.
참고: [Supabase CI 검사](https://supabase.com/docs/guides/deployment/ci/testing),
[Vercel prebuilt 배포](https://vercel.com/docs/cli/deploy).
