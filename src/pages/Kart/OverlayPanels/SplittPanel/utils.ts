import { HistoryEntry, HistoryState } from "contexts/HistoryContext";
import { KretsDelingEndringRequest, ObjektIdentifikator } from "types/api";
import { DelingForm, getCurrentDelingOnKrets } from "./useDelingForm";

export const mapDelingFormToKretsDelingEndringRequest = (
  delingForm: DelingForm | null,
  kommuneIdentifikator: ObjektIdentifikator,
): KretsDelingEndringRequest | null => {
  return null;
};

export const getExistingKretsDelingForKrets = (
  kretsLokalid: string | null,
  currentHistory: HistoryState,
): KretsDelingEndringRequest | undefined => {
  return currentHistory.entries
    .filter((entry) => entry.type === "kretsdeling")
    .flatMap((delingEntry) => delingEntry.changes.map((change) => change.to) as KretsDelingEndringRequest[])
    .findLast((kretsDeling) => kretsDeling.opprinneligKrets.lokalId === kretsLokalid);
};

export const addKretsDelingHistoryEntry = (
  currentHistory: HistoryState,
  addHistoryEntry: (entry: HistoryEntry) => void,
  newKretsDelingEntryRequest: KretsDelingEndringRequest,
) => {
  const existingKretsDelingForKrets = getExistingKretsDelingForKrets(
    newKretsDelingEntryRequest.opprinneligKrets.lokalId,
    currentHistory,
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
