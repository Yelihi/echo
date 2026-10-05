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
