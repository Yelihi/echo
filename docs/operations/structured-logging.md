# 업무 로그

Node 서버는 Pino JSON을 stdout으로 출력한다. 업무 서비스는 `RecordOperationEvent`
함수만 전달받으며 테스트에서는 메모리 기록기를 사용한다.
`operationId`는 한 번의 함수 실행, `resourceId`는 해당 업무의 세션 또는 녹음을 식별한다.
이는 분산 trace ID나 저장 요청의 멱등성 키를 대신하지 않는다.

## 테스트

```sh
TEST_LOGS=1 npm test -- observeOperation --runInBand
```

시작과 종료 이벤트는 같은 operationId를 가진다. 실패 이벤트에는 오류 전문을 넣지 않는다.
로그 수집 실패는 업무 결과를 변경하지 않는다. 로그는 감사 원장이나 DB 정합성의 근거가 아니다.
DB 상태와 실제 저장 횟수는 통합 테스트에서 별도로 검증해야 한다.

## SigNoz Community 연결

[공식 자체 호스팅 설치](https://signoz.io/docs/install/docker/)로 Community를 설치한다.
Enterprise 기능이나 SigNoz Cloud 구독은 필요하지 않지만 실행할 서버 자원은 필요하다.

로컬 또는 VM에서 Node stdout을 파일로 수집한 후 Collector Contrib로 전달한다.
서버리스 환경은 이 파일 수집 설정을 사용할 수 없으므로 플랫폼의 로그 전송 기능이 필요하다.
Supabase 호스팅 worker 로그 역시 별도의 수집 연결이 필요하다.

```sh
npm run dev 2>&1 | tee /tmp/echo-server.log
```

다른 터미널에서 Collector Contrib 0.153.0 이상을 사용한다.

```sh
ECHO_LOG_FILE=/tmp/echo-server.log \
SIGNOZ_OTLP_ENDPOINT=http://localhost:4318 \
otelcol-contrib --config observability/collector.yaml
```

SigNoz Logs Explorer에서 `service.name=echo-server`로 검색하고 operationId로 한 실행을 찾는다.
업무 로그 이외의 비 JSON 개발 서버 출력은 버린다. 이 설정은 로컬 검증용이며
재시작 시 파일을 다시 읽을 수 있다. 운영에서는 파일 rotation과 영속 offset 저장을 구성해야 한다.

[자체 호스팅 OTLP 수집 안내](https://signoz.io/docs/ingestion/self-hosted/overview/)

## 기록 범위

현재 연결된 이벤트는 `recording.draft.create`와 `recording.draft.accept`의
`started`, `succeeded`, `failed`이다. 성공은 현재 workflow 전체가 반환되었다는 의미이며,
단일 DB commit을 뜻하지 않는다. 분석 worker는 `audio.download`, `audio.transcribe`,
`text.evaluate`, `result.save` 이벤트를 JSON으로 출력한다. jobId와 targetId로 타깃을,
operationId로 개별 실행을 구분한다. 클라이언트는 `recording.start`, `recording.stop`,
`recording.reset`을 브라우저 콘솔에 JSON으로 출력한다. 녹음 시작 취소는 `canceled`로
기록한다. 브라우저 로그의 서버 전송 및 SigNoz 연결은 아직 구현하지 않았다.
음성, 전사 전문, 사용자 토큰, 서명 URL은 로그에 포함하지 않는다.
