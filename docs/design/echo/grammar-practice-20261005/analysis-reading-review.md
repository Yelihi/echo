# 분석 읽기 화면 보완 — #150 / PR #163

## 기본 동작

AI 분석 결과의 의미 덩어리를 그대로 표시한다. 사용자가 구간을 직접 나누는 것을 등록의 필수 단계로 요구하지 않는다. 구간을 누르면 문장 아래에 직독직해, 해당 문장 성분, 설명, 관련 구문을 표시한다. 문법 성분과 구문은 기존 분석 데이터에서 가져오며 UI가 새로 추론하지 않는다.

선택한 구간은 붉은 강조 대신 흰 블록, 중립색 테두리, 그림자와 작은 상승 효과로 구분한다. 풀이는 기존 Echo 등장 애니메이션을 사용한다. `prefers-reduced-motion`에서는 이동과 등장 애니메이션을 생략한다. 키보드 포커스는 선택 상태와 별개로 표시한다.

## 수정 흐름

`분석 수정`을 누른 경우에만 구간·계층 편집을 표시한다. `읽기로 돌아가기`와 Escape로 읽기 화면으로 복귀한다. 적용하지 않은 수정이 있으면 공통 ConfirmDialog로 계속 편집/수정 버리기를 선택한다. 원문 보존, 잘못된 계층과 경계의 원자적 거절, 실패 후 입력 보존은 유지한다.

읽기 표시, 도구 모음, 편집 항목 탐색, 수정 입력, 이탈 확인을 분리했다. 선택/모드 전환/편집 이벤트는 features의 store가 담당하며 각 chunk는 필요한 상태만 구독한다. 스타일은 JSX 내 Tailwind와 CVA를 사용한다. 경계 표기의 인위적인 공백을 제거했고 문장 끝에서 빈 구간을 추가하지 못하게 했다.

## 검증

- 전체 Jest: 124 suites / 451 tests 통과.
- Chromium Storybook: 6개 통과(기본, 선택 풀이, 경계, 계층 오류, 비연속 구문, 읽기로 복귀).
- TypeScript, 변경 범위 ESLint, Next.js production build 통과.
- 실제 브라우저의 데스크톱과 390px 읽기 화면 확인. 모바일 읽기 화면의 contentWidth와 viewportWidth 모두 390px.
- 읽기/수정 전환, Escape 포커스, 미적용 입력 이탈 확인은 자동 테스트로 검증.

현재 범위는 독립 컴포넌트/Storybook이다. AI 서비스와 저장 및 실제 등록 페이지 연결은 별도 이슈이며 이 PR에서 연결했다고 간주하지 않는다. 미리보기 데이터는 fixture다.

## 편집 책임 분리 — 2026-10-06

문자열 action type을 해석하던 `editAnalysis` 분기를 제거하고 `EditAnalysisService`의 동작별 메서드로 분리했다. 이벤트는 `edit(service => service.moveBoundary(chunkId, end))`처럼 필요한 동작을 직접 지정한다.

- `EditAnalysisService`: 변경하지 않는 입력 스냅샷을 바탕으로 경계 이동·나누기·합치기·풀이 수정·문법/구문 저장 및 삭제를 각각 처리한다.
- `validateAnalysisCandidate`: 도메인 검증과 재검토 상태 전환을 공통 적용한다.
- `applyAnalysisEdits`: 이전 편집 결과를 다음 동작에 전달하고 첫 실패에서 중단한다. 중간 결과를 store에 쓰지 않는다.
- store: 전체 성공 시에만 분석·선택·dirty 상태를 반영하고 소비자에게 한 번 알린다.

새 편집을 추가해도 기존 메서드, 배치 적용 루프, store의 성공 반영 경로에 편집 종류 분기를 추가하지 않는다. 편집 계약과 UI props 계약은 별도 모델 파일로 분리했다. 인라인 타입 import도 상단 `import type`으로 정리했다.

회귀 검증: 전체 Jest 124 suites / 456 tests, Chromium Storybook 6개, TypeScript와 변경 범위 ESLint 통과. 배치 실패 시 입력·선택 보존 및 후속 동작 중단, 성공 시 앞선 편집 보존과 단일 반영, 각 편집의 검증·원문 보존을 확인했다. 이번 변경에는 화면 배치나 스타일 변경이 없어 이전 시각 검토를 유지하고 Storybook 상호작용을 다시 검증했다.

## PR 댓글 반영과 유지 근거 — 2026-10-06

- **변환 함수**: `models/converters/convertAnalysisToChunkReading.ts`로 옮겼다. 저장된 분석을 읽기용 모델로 변환하므로 범용 utils가 아닌 converter로 명명한다. 문법 추론을 추가하지 않는다.
- **store 생성과 Provider**: 테스트 전용 주입이 아니다. 각 에디터가 받은 초기 분석과 선택·수정 모드·미적용 입력을 해당 인스턴스 수명에 묶는다. 전역 singleton의 초기화/정리 순서에 의존하지 않는다. Context에는 고정된 vanilla store 참조를 전달하고, 상태 변화는 Zustand selector로 구독한다. 이는 [Zustand의 props 초기화 지침](https://zustand.docs.pmnd.rs/learn/guides/initialize-state-with-props)과 같은 패턴이다. 현재 실제 페이지에 여러 에디터가 배치되어 있다는 의미는 아니다.
- **초기값과 콜백**: `initialAnalysis`는 마운트 시 초기값이다. 다른 문서/분석으로 교체하려면 소비자가 key를 바꾼다. 부모의 재렌더링은 편집 상태를 초기화하지 않으며, `onChange`가 바뀌면 최신 콜백으로 알리도록 수정했다. 초기 콜백을 store가 계속 보관하던 문제를 해결한다.
- **입력 책임**: 풀이 필드, 경계 미리보기, 나누기 미리보기를 분리했다. 경계와 나누기는 각각의 컴포넌트에서 필요한 state만 관리한다. 풀이 텍스트는 적용 전까지 DOM 입력값으로 보존하고 적용할 때 FormData로 읽는다. 타이핑마다 텍스트를 React state에도 복제하거나 상위 입력 묶음을 다시 렌더링할 이유가 없기 때문이다. 공통 적용 hook은 현재 풀이와 구조 변경을 기존 원자적 편집 흐름에 전달하고 UI용 오류를 관리한다.
- **클라이언트 경계**: 조합 컴포넌트에서 hooks와 이벤트를 제거하고 읽기/수정 분기 및 키보드 처리를 작은 client component로 옮겼다. 파일을 나눴다고 client parent에서 가져온 하위 컴포넌트가 Server Component가 되는 것은 아니다. 이번 변경의 검증 대상은 상태 구독과 렌더링 책임이며, 번들 크기나 SSR 개선을 주장하지 않는다.
- **키보드 핸들러**: JSX 밖 이름 있는 함수로 분리했다. 이벤트가 발생할 때 `store.getState()`로 읽으므로 키보드 처리만을 위한 상태 구독이 없다. 직접 DOM에 전달하고 memo 자식이나 effect 의존성으로 사용하지 않으므로 `useCallback`을 추가하지 않았다. 함수 생성 자체가 렌더링을 발생시키는 것은 아니다. [React useCallback 문서](https://react.dev/reference/react/useCallback)의 참조 안정성이 필요한 경우와 구분한다.
- **포커스 탐색과 확인창 예외**: 현재 에디터의 DOM 안에서 선택 버튼 또는 읽기 복귀 버튼을 찾아 포커스를 복원한다. 별도 DOM ref 대신 이벤트의 `currentTarget`을 사용한다. 포털 이벤트도 React 트리로 전파되므로 alertdialog 내부 Escape는 Radix에 맡겨 편집기와 확인창이 동시에 닫히지 않도록 한다.

회귀 검증: 전체 Jest 125 suites / 462 tests 통과. 두 에디터의 선택·수정 격리, 부모 재렌더링 시 입력 보존 및 최신 콜백, 문서 key 변경, 확인창 Escape, 유효성 실패 후 입력 보존, 풀이와 경계의 단일 반영을 확인했다. Profiler로 풀이 입력 시 컨트롤들이 다시 commit되지 않으며 경계 미리보기 변경은 해당 컨트롤에서만 commit됨을 검증했다. 테스트 관찰 래퍼는 실제 컴포넌트를 실행한다.

Chromium Storybook 10개 통과: 기존 6개와 풀이 입력·경계 미리보기/적용·마지막 구간 비활성·나누기 미리보기/적용 4개. TypeScript, 변경 범위 ESLint, Next.js production build 통과. 화면 배치·테마 변경은 없으며 실제 페이지 연결 범위도 동일하다.
