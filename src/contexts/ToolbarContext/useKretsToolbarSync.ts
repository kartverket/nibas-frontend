import { useEffect } from "react";
import { KretsHistoryEntry } from "contexts/ToolbarContext";

const getChangeForId = <EntryType extends KretsHistoryEntry>(
  entry: EntryType,
  id?: string
) =>
  // https://github.com/microsoft/TypeScript/issues/33591
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (entry.changes as any[]).find((change) => change.id === id) as
    | EntryType["changes"][number]
    | undefined;

type Parameters<EntryType extends KretsHistoryEntry> = {
  kretsId: string | undefined;
  setFormValues: (
    change: EntryType["changes"][number],
    direction: "to" | "from"
  ) => void;
  undoEventKey: string;
  redoEventKey: string;
};

const useKretsToolbarSync = <EntryType extends KretsHistoryEntry>({
  kretsId,
  undoEventKey,
  redoEventKey,
  setFormValues,
}: Parameters<EntryType>) => {
  useEffect(() => {
    const undoKrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as EntryType;

      const changeForThisId = getChangeForId(entry, kretsId);

      if (!changeForThisId) return;

      setFormValues(changeForThisId, "from");
    }) as EventListener;

    document.addEventListener(undoEventKey, undoKrets);

    return () => {
      document.removeEventListener(undoEventKey, undoKrets);
    };
  }, [kretsId, setFormValues, undoEventKey]);

  useEffect(() => {
    const redoKrets = ((e: CustomEvent) => {
      const entry = e.detail.entry as EntryType;

      const changeForThisId = getChangeForId(entry, kretsId);

      if (!changeForThisId) return;

      setFormValues(changeForThisId, "to");
    }) as EventListener;

    document.addEventListener(redoEventKey, redoKrets);

    return () => {
      document.removeEventListener(redoEventKey, redoKrets);
    };
  }, [kretsId, redoEventKey, setFormValues]);
};

export default useKretsToolbarSync;
