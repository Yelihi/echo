let stopCurrent: (() => void) | null = null;

/** 노트 내 여러 버튼도 동시에 소리를 내지 않도록 재생 소유자를 한 곳에서 관리한다. */
export function claimGrammarPlayback(stop: () => void) {
  stopCurrent?.();
  stopCurrent = stop;

  return () => {
    if (stopCurrent === stop) stopCurrent = null;
  };
}
