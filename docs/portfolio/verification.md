# 도표의 코드 근거와 검증

확인일: 2026-10-08. README의 아키텍처와 시퀀스는 배포 기준 커밋 `f5bef1242dec003d2ed66357a9e5ba5568dfb59a`의 롤플레잉 흐름을 설명합니다. 어법 기능의 작업 브랜치나 향후 통합 인프라 구상은 포함하지 않았습니다.

**배포 주소 확인**

- 주소: https://echo-navy-iota.vercel.app
- GitHub Actions의 [운영 배포 실행](https://github.com/Yelihi/echo/actions/runs/37305949761)에서 운영 alias와 배포 커밋을 확인했습니다.
- 2026-10-08 비인증 GET/HEAD에서 `/login`으로 이동 후 HTTP 200을 확인했습니다. 인증 후 녹음·유료 분석의 E2E를 실행한 것은 아닙니다.

**도표와 코드의 대응**

| 도표                               | 확인한 코드                                                                                                                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [아키텍처](./architecture.html)    | 서버 인증, 녹음 Route Handler, 저장 서비스, 완료 RPC, cron, 분석 worker. 각 노드의 Sources에 커밋 고정 링크 포함                                                             |
| [녹음 시작·저장](./recording.html) | `AudioCapture`, `useRecordingSession`, `useRecordingTurn`, `useRoleplayRecordingPersistence`, `submitRoleplayRecording`, `saveLearnerRecording`, `commit_roleplay_recording` |
| [완료·분석](./analysis.html)       | `finish_roleplay_recording`, `claim_next_analysis_job`, `handleProcessAnalysisJob`, `processClaimedJob`, `save_claimed_analysis_result`, `loadSessionAnalysis`               |

시퀀스는 정상 경로를 중심으로 묶어 표현합니다. 분석 도표의 전사·평가는 실제로 순차적인 두 API 호출입니다. 이용 권한·할당량 검사, 재사용 결과 반환, 실패 분기는 README 본문과 근거 코드에서 설명합니다. 구조 설명과 운영 환경 설정 전체에 대한 감사는 구분합니다.

**생성·검증 결과**

Archify 2.17로 작성했습니다. 각 도표의 JSON이 원본이며 HTML은 `deliver`로 생성한 독립 뷰어, SVG는 해당 뷰어의 기본 Export → SVG로 저장한 README용 이미지입니다. 설명은 한국어이고 고정 뷰어 UI와 HTML lang은 도구 기본값인 영어입니다.

| 도표         | 종류         | Showcase 검사      | 브라우저 검사 | 이미지 직접 검토 | 수정 회차 |
| ------------ | ------------ | ------------------ | ------------- | ---------------- | --------- |
| architecture | architecture | 9/9, 오류 0·경고 0 | passed        | passed           | 0         |
| recording    | sequence     | 9/9, 오류 0·경고 0 | passed        | passed           | 1         |
| analysis     | sequence     | 9/9, 오류 0·경고 0 | passed        | passed           | 1         |

브라우저 검사는 Chrome에서 1440×900, 1600×1000, 1920×1080, 2048×1320의 가로·세로 넘침과 가독성을 확인했습니다. 1440×900 및 2048×1320의 light/dark 캡처를 수집했고, 2048×1320의 두 테마 이미지를 직접 검토해 연결선·레이블·배치를 확인했습니다. 자동 브라우저 검사와 이미지 직접 검토는 별개의 결과입니다.

제품 코드·DB·배포 설정은 변경하지 않았습니다. README와 도표의 링크·형식·출력물을 검증했으며 기존 제품 테스트의 결과를 이번 변경에서 다시 실행한 것처럼 보고하지 않습니다.

**산출물 식별값**

- `architecture.json`: `751fb7f4179575d0bb7ad8ad6342b75f2360059868fe1d962126c9a6d889f7ef` (4,665 bytes)
- `architecture.html`: `86337ffc0605c6c6d28cf1d63a6158bb6fa3446a759bdafc78287b07e18228f8` (808,455 bytes)
- `recording.json`: `5cbc4405946b7b7491bc8770768435868ff50fbcd4c931d11ec6da3d890f0e2d` (2,803 bytes)
- `recording.html`: `76fada55c4dd744738f285f4870dd32e407c5c86978ecdf42345565e03710f74` (805,392 bytes)
- `analysis.json`: `6e82cbc7aaaa5c0d5a1119ebdf5f056285b83664486ae9798602e5c8bee200c3` (3,392 bytes)
- `analysis.html`: `e0fdf944e1c1ca356ef0538d957eae9d7b9ffcd5d1e68c18f944601029e963a0` (808,738 bytes)

**다시 생성할 때**

Archify 설치 경로의 `bin/archify.mjs`를 사용합니다. 아키텍처는 코드 근거 검증을 위해 `--repo-root`가 필요합니다. JSON을 수정하면 validate → deliver → visual-check를 다시 실행하고 SVG를 다시 export합니다. 생성 파일은 검증 당시의 바이트를 유지하도록 Prettier 대상에서 제외했습니다.

```sh
node <archify>/bin/archify.mjs validate architecture docs/portfolio/architecture.json --repo-root . --quality showcase --json
node <archify>/bin/archify.mjs deliver architecture docs/portfolio/architecture.json docs/portfolio/architecture.html --repo-root . --quality showcase --json
node <archify>/bin/archify.mjs visual-check docs/portfolio/architecture.html --json
```

두 시퀀스도 같은 순서로 실행하되 종류는 `sequence`, 입력은 `recording.json` 또는 `analysis.json`이며 `--repo-root`는 생략합니다.
