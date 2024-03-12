import { EditingType, useEditAllGrenser } from "contexts/EditGrenserContext";
import { Flatedata } from "contexts/OverlayPanelContext";
import { useUtkast } from "contexts/UtkastContext";
import { useForm, useFieldArray } from "react-hook-form";
import { GrunnkretsResponse, KretsDelingEndringRequest, StemmekretsResponse } from "types/api";
import { getIdFromEntity } from "utils/api";
import {
  CustomOption,
  KontekstType,
  Krets,
  mapGrunnkretsResponseToKrets,
  mapStemmekretResponseToKrets,
} from "../hooks/tilhorighetUtils";
import { useKommuneStemmekretser } from "hooks/inndelinger/useStemmekretser";
import { useKommuneGrunnkretser } from "hooks/inndelinger/useGrunnkretser";
import { useToast } from "@kvib/react";
import { useCallback } from "react";

export type SplittingForm = Pick<KretsDelingEndringRequest, "opprinneligKrets" | "nyeKretser">;

export const getDefaultSplittingValue = () => ({
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

export const useSplittingForm = (flatedata: Flatedata) => {
  const { utkast, updateUtkast, getUpdateUtkastRequestFromHistory } = useUtkast();
  const toast = useToast();

  const {
    register,
    getValues,
    reset,
    formState: { errors },
    control,
    setValue,
    handleSubmit,
  } = useForm<SplittingForm>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: getDefaultSplittingValue(),
  });

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

  // Vi ønsker å håndtere opprinnelig krets som en "ny del", og derfor vil vi at den skal vises sammen med de nye kretsene også.
  const handleOpprinneligKretsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lokalid = e.target.value;
    replace(getDefaultSplittingValue().nyeKretser); // vi ønsker å resette til en tom liste ved bytte av opprinnelig krets
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

  const showSplittingSuccessToast = (
    opprinneligKretsInfo: Krets,
    nyeKretser: { kretsNavn: string; kretsNummer: string }[],
    isUpdateOfSplitting: boolean,
  ) => {
    const nyeKretserFormatted = nyeKretser.map((k) => `${k.kretsNummer} ${k.kretsNavn}`);
    const allButLastKretserFormatted = nyeKretserFormatted.slice(0, nyeKretserFormatted.length - 1);
    const nyeKretserString = allButLastKretserFormatted
      .join(", ")
      .concat(
        ` ${allButLastKretserFormatted.length > 0 ? "og" : ""} ${nyeKretserFormatted[nyeKretserFormatted.length - 1]}`,
      );

    toast({
      status: "success",
      title: !isUpdateOfSplitting
        ? `Du opprettet ${nyeKretserString} ved å splitte ${opprinneligKretsInfo.nummer} ${opprinneligKretsInfo.navn}`
        : `Oppdaterte splittingen av ${opprinneligKretsInfo.nummer} ${opprinneligKretsInfo.navn} til å inneholde ${nyeKretserString}. Husk å sjekke at tilhørigheten til nærliggende grenser er korrekt.`,
    });
  };

  // en del if-tester her for å forsikre typescript om at variablene vi bruker ikke er null.
  // (hadde ikke vært mulig å komme seg hit hvis noe var null, men typescript er typescript)
  const updateDraftWithSplittingRequest = () => {
    if (editingType && grunnkretser && stemmekretser) {
      const { opprinneligKrets, nyeKretser } = getValues();
      const opprinneligKretsInfo = opprinneligFlateOptions.find(
        (krets) => krets.id.lokalid.value === opprinneligKrets.lokalId,
      );
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
        opprinneligKretsInfo?.version
      ) {
        const exclusivelyNewKretser = nyeKretser.slice(1); // må fjerne opprinnelig krets her fordi vi har den i field
        const newKretsDelingEndringRequest = {
          opprinneligKrets: {
            lokalId: opprinneligKrets.lokalId,
            version: opprinneligKretsInfo.version,
          },
          kommuneId: kommuneIdentifikator,
          flatetype: editingType === "grunnkrets" ? KontekstType.GRUNNKRETS : KontekstType.STEMMEKRETS,
          nyeKretser: exclusivelyNewKretser,
        };

        const latestOperasjoner = getUpdateUtkastRequestFromHistory()?.operasjoner; // Vi vil lagre utkastet med de eksisterende endringene også
        if (utkast && latestOperasjoner) {
          const isUpdateOfSplitting = // hvis vi allerede har en splitting på samme krets ønsker vi å erstatte den med den nye splittingen
            latestOperasjoner.kretsDelingEndringer.some(
              (splitting) => splitting.opprinneligKrets.lokalId === opprinneligKrets.lokalId,
            );
          const previousSplitsWithoutSplitOnCurrentOpprinneligKrets = [
            ...utkast.operasjoner.kretsDelingEndringer.filter(
              (splitting) =>
                splitting.opprinneligKrets.lokalId !== newKretsDelingEndringRequest.opprinneligKrets.lokalId,
            ),
          ];
          updateUtkast(utkast.id, {
            ...utkast,
            operasjoner: {
              ...latestOperasjoner,
              kretsDelingEndringer: [
                ...previousSplitsWithoutSplitOnCurrentOpprinneligKrets,
                newKretsDelingEndringRequest,
              ],
            },
          });
          showSplittingSuccessToast(opprinneligKretsInfo, exclusivelyNewKretser, isUpdateOfSplitting);
        }
      }
    }
  };

  const resetSplitting = useCallback(() => {
    reset(getDefaultSplittingValue());
  }, [reset]);

  return {
    editingType,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    resetSplitting,
    updateDraftWithSplittingRequest,
    setValue,
    getValues,
    handleOpprinneligKretsChange,
    handleSubmit,
    errors,
  };
};
