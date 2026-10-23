# 예문 음성 worker

- 예문 확정 후 서버가 작업을 등록하고 이 함수를 호출합니다. 202 응답 이후에도 `EdgeRuntime.waitUntil`로 최대 3건을 처리합니다.
- 필수 환경 변수: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `PROCESS_GRAMMAR_AUDIO_SECRET`. Next 서버에도 같은 processor secret을 설정합니다.
- 모델은 Next 서버의 `OPENAI_TTS_MODEL`(기본 `tts-1`)을 작업 등록 시 고정합니다. 브라우저는 문장·모델·Storage 경로를 지정하지 못합니다.
- migration 적용 및 함수 배포 후, 관리자 연결에서 `schedule_grammar_audio_processor_cron(function_url, secret)`을 호출하면 매분 미처리 작업을 확인합니다. 비밀 값은 커밋하지 않습니다.
- `grammar-audio`는 private bucket입니다. 파일은 시도별 경로에 `upsert: false`로 저장합니다. 작업 완료 RPC는 현재 claim과 살아 있는 예문을 확인한 뒤 연결합니다.
- 선점 후 10분이 지난 불확실한 작업은 `retryable`입니다. cron은 유료 생성을 자동 반복하지 않습니다. 사용자가 재시도해야 합니다.
- `grammar_audio_attempts.state = cleanup_pending`은 연결되지 않은 파일의 정리 의도입니다. 예문 삭제/정리 worker는 다음 이슈에서 연결합니다.

검증: `supabase test db supabase/tests/grammar_audio_lifecycle.test.sql` 및 Jest의 `processExampleAudioJob`, `requestGrammarAudio`, `ExampleAudioPreparation` 테스트. Storage 통합 검증은 로컬 `supabase status -o json` 결과를 임시 파일에 저장한 뒤 `node supabase/tests/grammar_audio_storage.integration.mjs /tmp/local-status.json`으로 실행합니다. 이 파일은 비밀 값을 포함하므로 커밋하지 않습니다. 테스트는 localhost만 허용하고 생성한 사용자·노트·파일을 정리하며 실제 TTS는 호출하지 않습니다.

실행 시간 제한을 넘으면 DB 선점 만료로 복구됩니다. [Supabase background tasks](https://supabase.com/docs/guides/functions/background-tasks)의 수명 제한을 따릅니다. 로컬 설정은 `edge_runtime.policy = "per_worker"`입니다.
