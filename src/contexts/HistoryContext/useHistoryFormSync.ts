import { useEffect } from "react";
import { HistoryDirection, MetadataEntry } from "contexts/HistoryContext/types";
import { addHistoryEventListener, MetadataHistoryEventName } from "./history-events";

const getChangeForId = (entry: MetadataEntry, id?: string) => entry.changes.find((change) => change.id === id);

type Parameters = {
  entityId: string | undefined;
  setFormValues: (change: MetadataEntry["changes"][number], direction: HistoryDirection) => void;
  undoEventKey: MetadataHistoryEventName | undefined;
  redoEventKey: MetadataHistoryEventName | undefined;
};

export const useHistoryFormSync = ({ entityId, undoEventKey, redoEventKey, setFormValues }: Parameters) => {
  useEffect(() => {
    if (undoEventKey == null) {
      return;
    }

    return addHistoryEventListener(undoEventKey, (event) => {
      const changeForThisId = getChangeForId(event.detail.entry, entityId);

      if (!changeForThisId) {
        return;
      }

      setFormValues(changeForThisId, "from");
    });
  }, [entityId, setFormValues, undoEventKey]);

  useEffect(() => {
    if (redoEventKey == null) {
      return;
    }

    return addHistoryEventListener(redoEventKey, (event) => {
      const changeForThisId = getChangeForId(event.detail.entry, entityId);

      if (!changeForThisId) {
        return;
      }

      setFormValues(changeForThisId, "to");
    });
  }, [entityId, redoEventKey, setFormValues]);
};
