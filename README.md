# Echo

**내가 익히고 싶은 영어로, 듣고 말하고 피드백받는 연습.**

## [→ Echo 서비스 바로가기](https://echo-navy-iota.vercel.app)

Google 로그인으로 시작합니다. 음성 생성·분석은 이용 권한이 부여된 계정에서 사용할 수 있습니다.

| 연습      | 사용 방법                                               | 현재 범위                                                 |
| --------- | ------------------------------------------------------- | --------------------------------------------------------- |
| 롤플레잉  | 대본 준비 → 역할 선택 → 상대방 듣기·내 대사 녹음 → 분석 | 저장·이어하기·분석 결과 조회 연결                         |
| 문단 암기 | 영어 문단 준비 → 읽기·암기 설정 → 녹음                  | 편집·연습 UI 제공. 녹음 저장·분석의 전체 연결은 후속 과제 |
| 어법 연습 | 문장·어법 분석 → 검토·저장 → 예문 생성 → 회상·시험      | 노트·예문·연습·기록 연결. 실제 AI·운영 DB 검증은 별도     |

## 구조와 설계 선택

![Echo 녹음·분석 아키텍처](./docs/portfolio/architecture.svg)

기존 Archify 구조도입니다. 웹 요청은 **Next.js**, 사용자 데이터와 녹음은 **Supabase**, 오래 걸리는 분석은 **Edge Function**이 맡습니다. [구조도 HTML](./docs/portfolio/architecture.html) · [설계·검증 기록](./docs/portfolio/verification.md)

| 고민                                    | 선택한 구조                      | 해결 방식                                                                           |
| --------------------------------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| 화면 조작과 서버 권한 검사가 뒤섞임     | Server / Client Component 분리   | 서버는 인증·조회, 클라이언트는 편집·녹음·재생을 담당                                |
| 녹음·대화·저장을 한 화면에서 모두 관리  | FSD 계층 + 책임별 상태           | 장치는 `AudioCapture`, 녹음 전이는 reducer, 대화 진행은 Zustand, 저장은 서버 서비스 |
| 파일은 올라갔는데 DB 확정 응답이 유실됨 | Storage + 멱등 저장 RPC          | 같은 녹음 ID·해시로 재시도하고 DB에서 저장 순서·중복을 검사                         |
| 전사·평가가 웹 요청보다 오래 걸림       | Postgres 작업 큐 + cron + worker | 완료 시 작업을 남기고, 문장별 결과를 저장하며 분할 처리                             |

- **주요 기술:** Next.js App Router · React · TypeScript / Zustand / Supabase / OpenAI.
- **UI·검증:** Tailwind CSS · CVA · Radix UI / Jest · Testing Library · Storybook.
- **선택의 비용:** 파일과 DB는 하나의 트랜잭션이 아니며, 분석 시작에는 cron 대기가 생깁니다. 재시도·작업 선점을 별도로 설계했습니다.

### FSD: 화면에서 공용 기반으로 내려가는 의존성

![Echo의 FSD 계층](./docs/portfolio/fsd.svg)

FSD(Feature-Sliced Design)를 바탕으로 **역할이 같은 코드를 모으고, 상위 계층이 하위 계층을 사용**하도록 구성했습니다. Next.js의 라우팅은 `app`, 화면 조합은 `views`로 구분한 프로젝트 변형입니다.

| 계층       | 맡은 일                      | 예시                                      |
| ---------- | ---------------------------- | ----------------------------------------- |
| `app`      | 라우트·레이아웃·서버 진입점  | `page.tsx`, 인증 callback, 녹음 API       |
| `views`    | 화면 조합·화면별 이벤트 진행 | 대본 편집기, 녹음 화면, 분석 결과         |
| `widgets`  | 여러 화면에서 쓰는 UI 조합   | 앱 셸, 내비게이션                         |
| `features` | 사용자가 수행하는 기능       | TXT 불러오기, 녹음 저장, 음성 요청        |
| `entities` | 도메인 모델·규칙·저장 계약   | 대본, 세션, 녹음, repository              |
| `shared`   | 공용 UI·장치·외부 연동 기반  | 버튼, `AudioCapture`, Supabase 클라이언트 |

- **읽는 단위:** 계층 → 기능/도메인 → `ui`·`models`·`services`. 예: `features/recording-storage/services`.
- **의존 규칙:** 아래 계층을 사용할 수 있으며, 모든 계층을 차례로 거칠 필요는 없습니다. 그림은 계층 규칙이지 전체 import 그래프는 아닙니다.
- **실행 위치는 별도 구분:** 같은 계층에도 서버·클라이언트 코드가 있습니다. `server-only`와 주요 녹음·분석 경계의 ESLint 규칙으로 잘못된 연결을 막습니다.
- **서버 밖 분석:** `supabase/migrations`에 DB 제약·작업 선점, `supabase/functions`에 분석 worker를 둡니다.

[탐색 가능한 FSD 구조도](./docs/portfolio/fsd.html)

## 대표 이벤트 흐름

아래 시퀀스는 현재 코드의 정상 경로를 중심으로 정리했습니다. 역할 분리·상대방 발화·백그라운드 분석은 **롤플레잉 기준**이며, 문단 암기의 미연결 경로와 구분합니다. Archify HTML은 내려받아 브라우저에서 열 수 있습니다. 도표 설명은 한국어, 뷰어 기본 메뉴는 영어입니다.

### 1. 영어 대본·문단 저장

![영어 자료 저장 시퀀스](./docs/portfolio/material-save.svg)

- **흐름:** 편집 초안 → 인증·스키마 검증 → repository 저장 → 목록 갱신.
- **보존:** 저장 오류는 화면에 알리고 입력을 유지합니다. 자료 수정과 연습 세션 스냅샷은 분리합니다.
- **Next.js 활용:** Server Action이 저장을 담당하고, `revalidatePath`로 자료 목록·마이페이지를 갱신합니다. 편집 화면은 성공 후 `router.push`·`router.refresh`로 이동·갱신합니다.

[대본 저장 코드](./src/views/role-play/services/action/saveRolePlayMaterial.ts) · [문단 저장 코드](./src/views/memorization/services/action/saveMemorizationMaterial.ts) · [시퀀스 HTML](./docs/portfolio/material-save.html)

### 2. TXT 파일 → AI 검증 → 파트너·내 역할 분리

![TXT 검증·역할 분리 시퀀스](./docs/portfolio/txt-import.svg)

- **흐름:** TXT 업로드 → 2인 대화 판별 → `partner`·`me` 분류 → 서버 재검증 → 편집기에 반영.
- **검증:** 확장자·빈 입력은 코드로 검사합니다. AI가 대화와 화자를 판별한 뒤, 응답 스키마·화자 수·대사의 화자 참조를 다시 검사합니다. 결과는 사용자가 검토·수정하고 저장합니다.
- **Next.js 활용:** File을 Server Action으로 전달하고, `server-only` 파서에서 OpenAI를 호출합니다. 클라이언트는 `useTransition`으로 대기·중복 동작을 관리합니다.

[TXT 파서](./src/features/roleplay-txt-import/services/server/parseRoleplayTxtImport.ts) · [AI 응답 재검증](./src/features/roleplay-txt-import/services/server/normalizeRoleplayTxtImportOutput.ts) · [시퀀스 HTML](./docs/portfolio/txt-import.html)

### 3. 음성 준비와 실제 대화

![목소리 확인·세션 생성 시퀀스](./docs/portfolio/session-preparation.svg)

![대화 차례별 음성·녹음 시퀀스](./docs/portfolio/conversation.svg)

- **시작 전:** 목소리·속도를 골라 샘플을 미리 듣습니다. 시작하면 대본·내 역할·음성 설정·평가 모드를 세션 스냅샷으로 저장합니다.
- **대화 중:** 상대방 차례마다 저장된 대사로 TTS 생성 → 재생 종료 → 내 대사 녹음 → 저장 후 다음 차례로 진행합니다. 마지막 상대방 대사가 있으면 그 발화까지 마친 뒤 완료합니다.
- **생성 시점:** 현재 구현은 **시작 전 샘플 생성 + 차례별 대사 생성**입니다. 전체 대화 음성을 미리 생성·영속 저장하는 방식은 아닙니다.
- **Next.js 활용:** Server Action에서 인증·세션·이용량을 확인하고 TTS를 호출합니다. 세션 경로로 `router.push`하며, Client Component가 브라우저 오디오·마이크 수명을 관리합니다.

[세션 생성](./src/views/role-play/services/action/createRolePlaySession.ts) · [음성 생성](./src/features/roleplay-sessions/services/actions/speakRolePlayPartnerLine.ts) · [대화 진행](./src/views/recording/services/hooks/useRoleplayRecordingController.ts) · [준비 시퀀스](./docs/portfolio/session-preparation.html) · [대화 시퀀스](./docs/portfolio/conversation.html)

### 4. 내 녹음 저장과 이어하기

![녹음 시작·저장 시퀀스](./docs/portfolio/recording.svg)

- **흐름:** 마이크 녹음 → 최종 Blob → 파일 업로드 → DB에서 녹음 확정·진행 위치 갱신.
- **실패 복구:** 성공 응답 뒤에만 Blob을 해제합니다. 저장 실패는 같은 녹음을 재시도하고, 완료 요청만 실패했다면 재녹음 없이 완료만 재시도합니다.
- **Next.js 활용:** `/api/roleplay-recordings` Route Handler가 `FormData`를 받아 인증·Origin·소유권·파일을 검사합니다. 뒤로가기로 복귀하면 `router.refresh`로 서버의 저장 위치를 다시 읽습니다.

[녹음 제어](./src/shared/lib/audio/AudioCapture.ts) · [서버 저장](./src/features/recording-storage/services/server/saveLearnerRecording.ts) · [시퀀스 HTML](./docs/portfolio/recording.html)

### 5. 대화 분석 백그라운드 처리

![세션 완료·비동기 분석 시퀀스](./docs/portfolio/analysis.svg)

- **등록:** 필수 녹음 확인 → 세션 완료와 `analysis_jobs` 생성을 한 DB 트랜잭션으로 처리.
- **실행:** cron → worker 선점 → 최대 3문장씩 오디오 전사·평가 → 문장별 저장 → 잔여 작업 재대기 또는 완료.
- **복구:** 성공한 문장은 남기고, 같은 입력·모델·분석 버전의 결과를 재사용합니다. `claim_token`으로 이전 worker의 늦은 쓰기를 거부합니다.
- **Next.js 활용:** 결과는 서버에서 소유권 확인 후 읽고, 진행 중에는 클라이언트가 갱신합니다. 재시도 Action은 경로를 무효화하며, 긴 AI 처리는 Next.js 요청 수명 밖에서 실행합니다. 결과 조회만으로 새 분석을 만들지 않습니다.

[worker 처리](./supabase/functions/process-analysis-job/processClaimedJob.ts) · [결과 조회](./src/views/analysis-result/services/server/loadSessionAnalysis.ts) · [시퀀스 HTML](./docs/portfolio/analysis.html)

## 실행과 검증

```sh
npm ci
cp .env.example .env.local
npm run dev                 # localhost:3000
```

- **환경:** Node.js 22, Supabase URL·키, Google OAuth callback 설정. 서버 음성·분석에는 OpenAI key·DB 마이그레이션·이용 권한이 필요합니다.
- **검사:** `npm test -- --runInBand` · `npm run typecheck` · `npm run lint` · `npm run build`.
- **UI 확인:** `npm run storybook`. 상호작용 검사는 `npx playwright install chromium` 후 `npm run test:storybook`.
- **검증 범위:** 로컬 테스트와 실제 계정·마이크·유료 AI E2E는 구분합니다. [검증 기록](./docs/portfolio/verification.md) · [Supabase 설정](./docs/operations/analysis-processor-supabase.md) · [AI 권한·비용](./docs/operations/ai-cost-controls.md).

## 어려웠던 문제와 해결

| 문제                               | 원인                                             | 분석                                      | 해결                                                                        |
| ---------------------------------- | ------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------- |
| 재시도할 때 녹음 중복              | DB 저장 후 응답만 유실될 수 있음                 | 버튼 잠금만으로 서버 중복을 막을 수 없음  | 같은 Blob에 같은 ID, 서버에서 ID·문장·SHA-256 비교 후 동일 요청은 성공 반환 |
| 저장 성공 후 완료 실패             | 문장 저장과 세션 완료가 별도 요청                | 재녹음하면 이미 확정한 데이터와 충돌      | 저장·완료 상태 분리, 완료 처리만 재시도                                     |
| 이탈 후 마이크·이전 음성 응답 도착 | 장치 권한·재생 요청이 화면보다 늦게 완료         | 오래된 콜백이 다음 차례를 바꿀 수 있음    | 요청 token 무효화, 마이크 트랙·오디오 URL 해제, 재생 차단 시 수동 재시도    |
| 일부 분석 실패 뒤 늦은 결과 저장   | `Promise.all`의 실패가 다른 실행을 취소하지 않음 | job을 먼저 닫으면 남은 문장이 뒤늦게 저장 | `allSettled` 후 상태 전환, `claim_token`으로 오래된 worker 쓰기 차단        |

남은 한계: 미저장 녹음은 브라우저 종료 시 복원되지 않습니다. 미확정 업로드 파일의 정리와, AI 호출 성공 후 결과 저장 전 장애로 인한 재과금 가능성은 별도 관리 대상입니다.
