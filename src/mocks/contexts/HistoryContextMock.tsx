import { HistoryContext } from "contexts/HistoryContext/HistoryContext";
import { HistoryContextValue } from "contexts/HistoryContext/types";
import { ReactNode } from "react";

const mockHistoryContextValue: HistoryContextValue = {
  addHistoryEntry: vitest.fn(),
  history: { entries: [], index: 0 },
  clearHistory: vitest.fn(),
  getHistoryEntries: vitest.fn(() => []),
  restoreHistoryState: vitest.fn(),
  canSave: false,
  undo: vitest.fn(),
  redo: vitest.fn(),
  reapplyCurrentEntries: vitest.fn(),
};

const MockHistoryProvider = ({ children }: { children: ReactNode }) => {
  return <HistoryContext.Provider value={mockHistoryContextValue}>{children}</HistoryContext.Provider>;
};

export { MockHistoryProvider };
