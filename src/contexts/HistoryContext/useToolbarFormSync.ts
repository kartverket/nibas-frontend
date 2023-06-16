import { useEffect } from "react";
import { KretsHistoryEntry, UtkastEntry } from "contexts/HistoryContext";

type FormEntry = KretsHistoryEntry | UtkastEntry;

const getChangeForId = <EntryType extends FormEntry>(
  entry: EntryType,
  id?: string
) =>
  // https://github.com/microsoft/TypeScript/issues/33591
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (entry.changes as any[]).find((change) => change.id === id) as
    | EntryType["changes"][number]
    | undefined;

type Parameters<EntryType extends FormEntry> = {
  entityId: string | undefined;
  setFormValues: (
    change: EntryType["changes"][number],
    direction: "to" | "from"
  ) => void;
  undoEventKey: string;
  redoEventKey: string;
};

const useToolbarFormSync = <EntryType extends FormEntry>({
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

export default useToolbarFormSync;
