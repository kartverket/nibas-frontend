import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { Flatedata } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import { useForm, useFieldArray } from "react-hook-form";
import { GrunnkretsResponse, KretsDelingEndringRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import {
  CustomOption,
  KontekstType,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "../hooks/tilhorighetUtils";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";

export type DelingForm = Pick<KretsDelingEndringRequest, "opprinneligKrets" | "nyeKretser">;

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
  grunnkretser: GrunnkretsResponse[],
  stemmekretser: StemmekretsResponse[],
) => {
  if (editingType == "stemmekrets") {
    return stemmekretser?.find((opt) => opt.id.lokalid.value === opprinneligKretsId)?.kommuneIdentifikator;
  } else {
    return grunnkretser?.find((opt) => opt.id.lokalid.value === opprinneligKretsId)?.kommuneIdentifikator;
  }
};

export const useDelingForm = (flatedata: Flatedata) => {
  const { utkast, updateUtkast } = useUtkast();
  const {
    register,
    getValues,
    reset,
    formState: { dirtyFields },
    control,
    setValue,
  } = useForm<DelingForm>({ defaultValues: getDefaultDelingValue() });

  const { fields, append, remove, prepend, replace } = useFieldArray({
    control,
    name: "nyeKretser",
  });

  const { getCurrentlyEditingType } = useEditAllGrenser();
  const editingType = getCurrentlyEditingType();
  const { data: stemmekretser } = useKommuneStemmekretser(flatedata ? getIdFromEntity(flatedata) : "");
  const { data: grunnkretser } = useKommuneGrunnkretser(flatedata ? getIdFromEntity(flatedata) : "");
  const opprinneligFlateOptions =
    editingType === "grunnkrets"
      ? mapGrunnkretsResponseToKrets(grunnkretser ?? [])
      : mapStemmekretResponseToKrets(stemmekretser ?? []);

  const handleOpprinneligKretsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lokalid = e.target.value;
    replace(getDefaultDelingValue().nyeKretser);
    setValue("opprinneligKrets.lokalId", lokalid, { shouldDirty: true });
    const kretsForNewOpprinneligKrets = opprinneligFlateOptions.find((krets) => krets.id.lokalid.value === lokalid);
    if (
      kretsForNewOpprinneligKrets &&
      !fields.find((field) => field.kretsNummer === kretsForNewOpprinneligKrets?.id.lokalid.value)
    ) {
      prepend({
        kretsNummer: kretsForNewOpprinneligKrets?.nummer,
        kretsNavn: kretsForNewOpprinneligKrets?.navn,
      });
    }
  };

  const updateDraftWithDelingRequest = () => {
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
          nyeKretser: nyeKretser.slice(1), // må fjerne opprinnelig krets her fordi vi har den i field
        };
        console.log(kretsDelingEndringRequest);
        if (utkast) {
          updateUtkast(utkast.id, {
            ...utkast,
            operasjoner: {
              ...utkast.operasjoner,
              kretsDelingEndringer: [...utkast.operasjoner.kretsDelingEndringer, kretsDelingEndringRequest],
            },
          });
          reset(getDefaultDelingValue());
        }

        // gi en feedback på at den ble delt (evt at bruker oppdaterte delingen sin på gitt krets)
      }
    }
  };

  const canSubmit = () => {
    return dirtyFields.opprinneligKrets && fields.length > 1;
  };

  return {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    canSubmit,
    reset,
    updateDraftWithDelingRequest,
    setValue,
    getValues,
    handleOpprinneligKretsChange,
  };
};
