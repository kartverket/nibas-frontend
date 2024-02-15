import { HistoryEntry, HistoryState } from "contexts/HistoryContext";
import { KretsDelingEndringRequest, ObjektIdentifikator } from "types/api";
import { DelingForm, getCurrentDelingOnKrets } from "./useDelingForm";

export const mapDelingFormToKretsDelingEndringRequest = (
  delingForm: DelingForm | null,
  kommuneIdentifikator: ObjektIdentifikator,
): KretsDelingEndringRequest | null => {
  return null;
};

export const addKretsDelingHistoryEntry = (
  currentHistory: HistoryState,
  addHistoryEntry: (entry: HistoryEntry) => void,
  newKretsDelingEntryRequest: KretsDelingEndringRequest,
) => {
  const existingKretsDelingForKrets = currentHistory.entries
    .filter((entry) => entry.type === "kretsdeling")
    .flatMap((delingEntry) => delingEntry.changes.map((change) => change.to) as KretsDelingEndringRequest[])
    .findLast(
      (kretsDeling) => kretsDeling.opprinneligKrets.lokalId === newKretsDelingEntryRequest.opprinneligKrets.lokalId,
    );
  addHistoryEntry({
    type: "kretsdeling",
    changes: [
      {
        id: newKretsDelingEntryRequest.opprinneligKrets.lokalId,
        from: existingKretsDelingForKrets ?? ({} as KretsDelingEndringRequest),
        to: newKretsDelingEntryRequest,
      },
    ],
  });
};
