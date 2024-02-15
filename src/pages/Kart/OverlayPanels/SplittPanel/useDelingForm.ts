import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { HistoryState, useHistory } from "contexts/HistoryContext";
import { Flatedata } from "contexts/OverlayPanelContext";
import { useKommuneGrunnkretserRef } from "hooks/inndelinger/useGrunnkretser";
import { useKommuneStemmekretserRef } from "hooks/inndelinger/useStemmekretser";
import { useFieldArray, useForm } from "react-hook-form";
import { GrunnkretsRef, KretsDelingEndringRequest, StemmekretsRef } from "types/api";
import { getIdFromEntity } from "utils/api";
import {
  CustomOption,
  KontekstType,
  mapGrunnkretsRefToKrets,
  mapStemmekretsRefToKrets,
} from "../hooks/tilhorighetUtils";
import { addKretsDelingHistoryEntry } from "./utils";

export type DelingForm = Pick<KretsDelingEndringRequest, "opprinneligKrets" | "nyeKretser">;

export const getCurrentDelingOnKrets = (
  kretsLokalid: string | null,
  currentHistory: HistoryState,
): DelingForm | null => {
  if (kretsLokalid) {
    const existingKretsDelingForKrets = currentHistory.entries
      .filter((entry) => entry.type === "kretsdeling")
      .flatMap((delingEntry) => delingEntry.changes.map((change) => change.to) as KretsDelingEndringRequest[])
      .findLast((kretsDeling) => kretsDeling.opprinneligKrets.lokalId === kretsLokalid);
    return {
      opprinneligKrets: existingKretsDelingForKrets?.opprinneligKrets ?? getDefaultDelingValue().opprinneligKrets,
      nyeKretser: existingKretsDelingForKrets?.nyeKretser ?? getDefaultDelingValue().nyeKretser,
    };
  }

  return null;
};

export const getDefaultDelingValue = () => ({
  opprinneligKrets: {
    lokalId: CustomOption.NOT_CHOSEN,
    version: 0,
  },
  nyeKretser: [],
});

const getKommuneIdentifikatorFromOptions = (
  editingType: EditingType,
  opprinneligKretsId: string,
  grunnkretser: GrunnkretsRef[],
  stemmekretser: StemmekretsRef[],
) => {
  if (editingType == "stemmekrets") {
    return stemmekretser?.find((opt) => opt.id.lokalid.value === opprinneligKretsId)?.kommuneIdentifikator;
  } else {
    return grunnkretser?.find((opt) => opt.id.lokalid.value === opprinneligKretsId)?.kommuneIdentifikator;
  }
};

export const useDelingForm = (flatedata: Flatedata) => {
  const { history, addHistoryEntry } = useHistory();

  const {
    register,
    getValues,
    reset,
    formState: { dirtyFields, isValid },
    control,
    setValue,
  } = useForm<DelingForm>({ defaultValues: getCurrentDelingOnKrets(null, history) ?? getDefaultDelingValue() });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "nyeKretser",
  });
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const { data: stemmekretser } = useKommuneStemmekretserRef(flatedata ? getIdFromEntity(flatedata) : "");
  const { data: grunnkretser } = useKommuneGrunnkretserRef(flatedata ? getIdFromEntity(flatedata) : "");
  const opprinneligFlateOptions =
    editingType === "grunnkrets"
      ? mapGrunnkretsRefToKrets(grunnkretser ?? [])
      : mapStemmekretsRefToKrets(stemmekretser ?? []);

  const updateDraftWithDelingEntry = () => {
    if (editingType && grunnkretser && stemmekretser) {
      const { opprinneligKrets, nyeKretser } = getValues();
      const opprinneligKretsVersion = opprinneligFlateOptions.find(
        (krets) => krets.id.lokalid.value === opprinneligKrets.lokalId,
      )?.version;
      const kommuneIdentifikator = getKommuneIdentifikatorFromOptions(
        editingType,
        opprinneligKrets.lokalId,
        grunnkretser,
        stemmekretser,
      );
      if (
        kommuneIdentifikator &&
        opprinneligKrets.lokalId.length > 0 &&
        nyeKretser.length > 0 &&
        opprinneligKretsVersion
      ) {
        const kretsDelingEndringRequest = {
          opprinneligKrets: {
            lokalId: opprinneligKrets.lokalId,
            version: opprinneligKretsVersion,
          },
          kommuneId: kommuneIdentifikator,
          flatetype: editingType === "grunnkrets" ? KontekstType.GRUNNKRETS : KontekstType.STEMMEKRETS,
          nyeKretser: nyeKretser,
        };
        addKretsDelingHistoryEntry(history, addHistoryEntry, kretsDelingEndringRequest);
      }
    }
  };

  return {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    isDirty: dirtyFields.opprinneligKrets && dirtyFields.nyeKretser,
    isValid,
    reset,
    updateDraftWithDelingEntry,
    setValue,
  };
};
