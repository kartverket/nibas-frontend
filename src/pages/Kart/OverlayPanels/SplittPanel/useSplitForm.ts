import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
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

type SplitForm = Pick<KretsDelingEndringRequest, "opprinneligKrets" | "nyeKretser">;

const getCurrentSplitOnKrets = (): SplitForm | null => {
  return null;
};

const getDefaultSplitValue = () => ({
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

export const useSplitForm = (flatedata: Flatedata) => {
  const {
    register,
    getValues,
    reset,
    formState: { dirtyFields },
    control,
    setValue,
  } = useForm<SplitForm>({ defaultValues: getCurrentSplitOnKrets() ?? getDefaultSplitValue() });

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

  const updateDraftWithSplitEntry = () => {
    if (editingType && grunnkretser && stemmekretser) {
      const { opprinneligKrets, nyeKretser } = getValues();
      const kommuneIdentifikator = getKommuneIdentifikatorFromOptions(
        editingType,
        opprinneligKrets.lokalId,
        grunnkretser,
        stemmekretser,
      );
      if (kommuneIdentifikator && opprinneligKrets.lokalId.length > 0 /*&& nyeKretser.length > 0*/) {
        const kretsDelingEndringRequest = {
          opprinneligKrets: opprinneligKrets,
          kommuneId: kommuneIdentifikator,
          flatetype: editingType === "grunnkrets" ? KontekstType.GRUNNKRETS : KontekstType.STEMMEKRETS,
          nyeKretser: nyeKretser,
        };
        console.log(kretsDelingEndringRequest);
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
    isDirty: dirtyFields.opprinneligKrets,
    reset,
    updateDraftWithSplitEntry,
    setValue,
  };
};
