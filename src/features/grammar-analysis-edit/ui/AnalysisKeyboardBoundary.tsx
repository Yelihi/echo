"use client";

import type { KeyboardEvent } from "react";
import type { AnalysisKeyboardBoundaryProps } from "../models/interface";
import { useAnalysisEditorStore } from "./AnalysisEditorProvider";

export function AnalysisKeyboardBoundary({ children }: AnalysisKeyboardBoundaryProps) {
  const store = useAnalysisEditorStore();

  // DOM 이벤트이므로 참조 메모화 없이 이름 있는 핸들러로 둔다.
  // 키를 누를 때만 최신 상태를 읽어, 키보드 처리용 상태 구독을 만들지 않는다.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || event.defaultPrevented) return;
    // 포털 안의 키 이벤트도 React 트리로 전파된다. 확인창의 Escape와 포커스는 Radix가 처리한다.
    if (event.target instanceof Element && event.target.closest('[role="alertdialog"]')) return;
    event.preventDefault();
    const { editing, finishEditing, select } = store.getState();
    // DOM 탐색은 현재 에디터 안으로 제한하고, 선택 해제/화면 전환 전에 복귀할 버튼을 찾는다.
    if (editing) {
      event.currentTarget.querySelector<HTMLButtonElement>("[data-analysis-action]")?.focus();
      finishEditing();
    } else {
      event.currentTarget
        .querySelector<HTMLButtonElement>('[data-chunk-id][aria-pressed="true"]')
        ?.focus();
      select(null);
    }
  }

  return (
    <div
      className="rounded-2xl border border-practice-line bg-white p-5 shadow-practice-panel sm:p-9"
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
