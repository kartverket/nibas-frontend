import { useEffect } from "react";
import { HistoryEntry } from "contexts/HistoryContext";

const getChangeForId = <EntryType extends HistoryEntry>(
  entry: EntryType,
  id?: string,
) =>
  // https://github.com/microsoft/TypeScript/issues/33591
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (entry.changes as any[]).find((change) => change.id === id) as
    | EntryType["changes"][number]
    | undefined;

type Parameters<EntryType extends HistoryEntry> = {
  entityId: string | undefined;
  setFormValues: (
    change: EntryType["changes"][number],
    direction: "to" | "from",
  ) => void;
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
