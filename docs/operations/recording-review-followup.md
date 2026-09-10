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
