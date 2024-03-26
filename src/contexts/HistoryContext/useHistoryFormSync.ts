import { useEffect } from "react";
import { HistoryDirection, HistoryEntry } from "contexts/HistoryContext/types";

const getChangeForId = <EntryType extends HistoryEntry>(entry: EntryType, id?: string) =>
  entry.changes.find((change) => change.id === id);

type Parameters<EntryType extends HistoryEntry> = {
  entityId: string | undefined;
  setFormValues: (change: EntryType["changes"][number], direction: HistoryDirection) => void;
  undoEventKey: string;
  redoEventKey: string;
};

export const useHistoryFormSync = <EntryType extends HistoryEntry>({
  entityId,
  undoEventKey,
  redoEventKey,
  setFormValues,
}: Parameters<EntryType>) => {
  useEffect(() => {
    const undo = ((e: CustomEvent) => {
      const entry = e.detail.entry as EntryType;

      const changeForThisId = getChangeForId(entry, entityId);

      if (!changeForThisId) return;

      setFormValues(changeForThisId, "from");
    }) as EventListener;

    document.addEventListener(undoEventKey, undo);

    return () => {
      document.removeEventListener(undoEventKey, undo);
    };
  }, [entityId, setFormValues, undoEventKey]);

  useEffect(() => {
    const redo = ((e: CustomEvent) => {
      const entry = e.detail.entry as EntryType;

      const changeForThisId = getChangeForId(entry, entityId);

      if (!changeForThisId) return;

      setFormValues(changeForThisId, "to");
    }) as EventListener;

    document.addEventListener(redoEventKey, redo);

    return () => {
      document.removeEventListener(redoEventKey, redo);
    };
  }, [entityId, redoEventKey, setFormValues]);
};
