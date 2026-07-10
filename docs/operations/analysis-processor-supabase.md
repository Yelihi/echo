# Analysis Processor Supabase 운영 가이드

이 문서는 `process-analysis-job` Edge Function을 원격 Supabase에 설정하고, OpenAI quota/key 문제를 처리하는 절차를 정리합니다.

## 필요한 값

로컬 `.env.local`에는 최소한 아래 값이 있어야 합니다.

```bash
SUPABASE_PROJECT_REF=
SUPABASE_DB_PASSWORD=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PROCESS_ANALYSIS_SECRET=
OPENAI_API_KEY=
```

주의:

- `.env.local`은 git에 올리지 않습니다.
- `PROCESS_ANALYSIS_SECRET`은 pg_cron과 Edge Function 사이의 호출 인증값입니다.
- `OPENAI_API_KEY`는 로컬 Next API와 Supabase Edge Function secret 양쪽에 맞춰야 합니다.

## 원격 DB migration 적용

cron 등록 함수가 원격 DB에 없으면 먼저 migration을 적용합니다.

```bash
npm run supabase -- db push --dry-run --linked --password "$SUPABASE_DB_PASSWORD"
npm run supabase -- db push --linked --password "$SUPABASE_DB_PASSWORD"
```

dry-run에서 `20260706090000_analysis_processor_cron.sql`만 나오는지 확인한 뒤 실제 push를 실행합니다.

## Edge Function secret 설정

secret 값을 명령줄에 직접 쓰면 shell history에 남을 수 있으므로 임시 env 파일을 사용합니다.

```bash
cat > /tmp/analysis-processor-secrets.env <<EOF
OPENAI_API_KEY=$OPENAI_API_KEY
PROCESS_ANALYSIS_SECRET=$PROCESS_ANALYSIS_SECRET
EOF

npm run supabase -- secrets set \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --env-file /tmp/analysis-processor-secrets.env
```

확인은 값이 아니라 이름만 봅니다.

```bash
npm run supabase -- secrets list --project-ref "$SUPABASE_PROJECT_REF"
```

참고:

- Supabase 런타임은 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 기본 제공할 수 있습니다.
- CLI가 `SUPABASE_` prefix secret 설정을 건너뛰면 정상일 수 있습니다.

## Edge Function 배포

pg_cron은 Supabase JWT가 아니라 `PROCESS_ANALYSIS_SECRET` bearer token으로 호출하므로 `--no-verify-jwt`가 필요합니다.

```bash
npm run supabase -- functions deploy process-analysis-job \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --no-verify-jwt \
  --use-api
```

## pg_cron 등록

Edge Function URL과 secret을 이용해 cron을 등록합니다.

```sql
select public.schedule_analysis_processor_cron(
  'https://<project-ref>.supabase.co/functions/v1/process-analysis-job',
  '<PROCESS_ANALYSIS_SECRET>',
  '* * * * *'
);
```

등록 확인:

```bash
npm run supabase -- db query --linked \
  "select jobname, schedule, active from cron.job where jobname = 'process-analysis-job';" \
  -o table
```

기대값:

```text
process-analysis-job | * * * * * | true
```

## Smoke test

queued job이 없을 때 Edge Function이 정상 연결되어 있으면 `idle`이 반환됩니다.

```bash
curl -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/process-analysis-job" \
  -H "Authorization: Bearer $PROCESS_ANALYSIS_SECRET"
```

기대 응답:

```json
{ "status": "idle" }
```

## OpenAI insufficient_quota 처리

다음 에러는 코드 문제가 아니라 OpenAI 계정/프로젝트의 billing 또는 quota 문제입니다.

```text
OpenAI STT failed: insufficient_quota
```

확인 순서:

1. OpenAI Platform에서 결제 수단이 활성화되어 있는지 확인합니다.
2. API key가 속한 Project에 사용 가능한 credit/budget이 있는지 확인합니다.
3. Project usage limit이 너무 낮게 설정되어 있지 않은지 확인합니다.
4. `.env.local`의 `OPENAI_API_KEY`와 Supabase Edge Function secret의 `OPENAI_API_KEY`가 같은 Project key인지 확인합니다.

같은 key의 billing/quota만 복구한 경우:

- Supabase secret을 다시 설정하지 않아도 됩니다.
- `/test`에서 다시 `Processor 실행`하면 됩니다.

새 OpenAI key로 교체한 경우:

```bash
cat > /tmp/analysis-processor-secrets.env <<EOF
OPENAI_API_KEY=$OPENAI_API_KEY
PROCESS_ANALYSIS_SECRET=$PROCESS_ANALYSIS_SECRET
EOF

npm run supabase -- secrets set \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --env-file /tmp/analysis-processor-secrets.env
```

secret 반영 후 먼저 재실행해보고, 여전히 이전 key처럼 동작하면 function을 다시 배포합니다.

```bash
npm run supabase -- functions deploy process-analysis-job \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --no-verify-jwt \
  --use-api
```

## `/test` 검증 순서

1. `/test` 접속
2. `테스트 UUID 생성`
3. `녹음 시작`
4. `녹음 정지`
5. `업로드 + Job 요청`
6. `Processor 실행`
7. `상태 조회`

성공 시 `analysis_jobs.status`는 `completed`가 되고, `practice_target_analysis_results`에 transcript/feedback/diff/score가 저장됩니다.

실패 시 `analysis_jobs.status`는 `failed`가 되고, `error_message`에 원인이 저장됩니다.
