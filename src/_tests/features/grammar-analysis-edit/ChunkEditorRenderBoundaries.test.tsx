import { Profiler } from "react";
import type * as FieldsModule from "@/features/grammar-analysis-edit/ui/ChunkExplanationFields";
import type * as BoundaryModule from "@/features/grammar-analysis-edit/ui/ChunkBoundaryEditor";
import type * as SplitModule from "@/features/grammar-analysis-edit/ui/ChunkSplitEditor";
import { expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { createGrammarAnalysis } from "@/_tests/fixtures/grammarAnalysis";
import { AnalysisEditorProvider } from "@/features/grammar-analysis-edit/ui/AnalysisEditorProvider";
import type * as ChunkEditorModule from "@/features/grammar-analysis-edit/ui/ChunkEditor";

const commits = { fields: jest.fn(), boundary: jest.fn(), split: jest.fn() };
// 실제 컴포넌트를 그대로 실행하고 Profiler로 commit 범위만 관찰한다.
jest.mock("@/features/grammar-analysis-edit/ui/ChunkExplanationFields", () => {
  const { ChunkExplanationFields: Fields } = jest.requireActual<typeof FieldsModule>(
    "@/features/grammar-analysis-edit/ui/ChunkExplanationFields",
  );
  return {
    ChunkExplanationFields: (props: React.ComponentProps<typeof Fields>) => (
      <Profiler id="fields" onRender={commits.fields}>
        <Fields {...props} />
      </Profiler>
    ),
  };
});
jest.mock("@/features/grammar-analysis-edit/ui/ChunkBoundaryEditor", () => {
  const { ChunkBoundaryEditor: Boundary } = jest.requireActual<typeof BoundaryModule>(
    "@/features/grammar-analysis-edit/ui/ChunkBoundaryEditor",
  );
  return {
    ChunkBoundaryEditor: (props: React.ComponentProps<typeof Boundary>) => (
      <Profiler id="boundary" onRender={commits.boundary}>
        <Boundary {...props} />
      </Profiler>
    ),
  };
});
jest.mock("@/features/grammar-analysis-edit/ui/ChunkSplitEditor", () => {
  const { ChunkSplitEditor: Split } = jest.requireActual<typeof SplitModule>(
    "@/features/grammar-analysis-edit/ui/ChunkSplitEditor",
  );
  return {
    ChunkSplitEditor: (props: React.ComponentProps<typeof Split>) => (
      <Profiler id="split" onRender={commits.split}>
        <Split {...props} />
      </Profiler>
    ),
  };
});

it("does not render sibling controls while typing or changing a boundary preview", () => {
  // next/jest의 SWC 변환에서는 가져온 jest.mock이 hoist되지 않으므로 관찰 래퍼 등록 후 읽는다.
  const { ChunkEditor } = jest.requireActual<typeof ChunkEditorModule>(
    "@/features/grammar-analysis-edit/ui/ChunkEditor",
  );
  const analysis = createGrammarAnalysis();
  render(
    <AnalysisEditorProvider initialAnalysis={analysis} onChange={jest.fn()}>
      <ChunkEditor chunk={analysis.chunks[0]} />
    </AnalysisEditorProvider>,
  );
  Object.values(commits).forEach((spy) => {
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
  });
  fireEvent.change(screen.getByLabelText("직독직해"), { target: { value: "새 뜻" } });
  expect(screen.getByLabelText("직독직해")).toHaveValue("새 뜻");
  Object.values(commits).forEach((spy) => expect(spy).not.toHaveBeenCalled());
  fireEvent.change(screen.getByLabelText("다음 구간과의 경계"), { target: { value: "3" } });
  expect(commits.boundary).toHaveBeenCalled();
  expect(commits.fields).not.toHaveBeenCalled();
  expect(commits.split).not.toHaveBeenCalled();
});
