import { useToast } from "@kvib/react";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { getKretsDelingEntries } from "contexts/HistoryContext/history-utils";
import { InndelingOfType } from "contexts/InndelingerContext/InndelingerContext";
import useKommuneInndelinger, { mapKommunalKretserResponseToKrets } from "hooks/inndelinger/useKommuneInndelinger";
import { useFieldArray, useForm } from "react-hook-form";
import { INNDELINGTYPE_VALUES, KretsDelingEndringRequest } from "types/api";
import { CustomOption, Krets } from "../hooks/tilhorighet-utils";

export const SPLITTABLE_INNDELINGTYPE_VALUES = INNDELINGTYPE_VALUES.filter(
  (type) => type === "GRUNNKRETS" || type === "STEMMEKRETS",
);
export type SplittingForm = Pick<KretsDelingEndringRequest, "opprinneligKrets" | "nyeKretser">;
type SplittingFormInndelingtype = (typeof SPLITTABLE_INNDELINGTYPE_VALUES)[number];
export type SplittableInndelingType = InndelingOfType<SplittingFormInndelingtype>;

const getDefaultSplittingValue = () => ({
  opprinneligKrets: {
    lokalId: CustomOption.NOT_CHOSEN,
    version: 0,
  },
  nyeKretser: [],
});

export const useSplittingForm = (inndeling: SplittableInndelingType | null) => {
  const toast = useToast();

  const {
    register,
    getValues,
    reset,
    formState: { errors, isSubmitted },
    control,
    setValue,
    handleSubmit,
    trigger,
  } = useForm<SplittingForm>({
    mode: "onSubmit",
    defaultValues: getDefaultSplittingValue(),
  });

  const { fields, append, remove, prepend, replace } = useFieldArray({
    control,
    name: "nyeKretser",
  });

  const { addHistoryEntry, getHistoryEntries } = useHistory();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const inndelingtype = inndeling?.inndelingtype;
  const { data: kretser } = useKommuneInndelinger(inndeling?.id ?? null, gyldighetsdato, inndelingtype);

  const opprinneligFlateOptions =
    kretser != null && inndelingtype != null ? mapKommunalKretserResponseToKrets(kretser, inndelingtype) : null;

  // Vi ønsker å håndtere opprinnelig krets som en "ny del", og derfor vil vi at den skal vises sammen med de nye kretsene også.
  const handleOpprinneligKretsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lokalid = e.target.value;
    replace(getDefaultSplittingValue().nyeKretser); // vi ønsker å resette til en tom liste ved bytte av opprinnelig krets
    setValue("opprinneligKrets.lokalId", lokalid, { shouldDirty: true });
    const kretsForNewOpprinneligKrets = opprinneligFlateOptions?.find((krets) => krets.id.lokalid.value === lokalid);
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

  const hasAlreadySplittedKrets = (krets: Krets): boolean => {
    const currentHistoryEntires = getHistoryEntries();
    return getKretsDelingEntries(currentHistoryEntires)
      .flatMap((entry) => entry.changes)
      .some((change) => change.id === krets.id.lokalid.value);
  };

  const showSplittingSuccessToast = (
    opprinneligKretsInfo: Krets,
    nyeKretser: { kretsNavn: string; kretsNummer: string }[],
  ) => {
    const nyeKretserFormatted = nyeKretser.map((k) => `"${k.kretsNummer} ${k.kretsNavn}"`);
    const allButLastKretserFormatted = nyeKretserFormatted.slice(0, nyeKretserFormatted.length - 1);
    const nyeKretserString = allButLastKretserFormatted
      .join(", ")
      .concat(
        ` ${allButLastKretserFormatted.length > 0 ? "og" : ""} ${nyeKretserFormatted[nyeKretserFormatted.length - 1]}`,
      );

    toast({
      status: "success",
      title: "Splitting utført",
      description: hasAlreadySplittedKrets(opprinneligKretsInfo)
        ? `Oppdaterte splittingen av "${opprinneligKretsInfo.nummer} ${opprinneligKretsInfo.navn}" til å inneholde ${nyeKretserString}. Husk å sjekke at tilhørigheten til nærliggende grenser er korrekt.`
        : `Du opprettet ${nyeKretserString} ved å splitte "${opprinneligKretsInfo.nummer} ${opprinneligKretsInfo.navn}"`,
    });
  };

  // en del if-tester her for å forsikre typescript om at variablene vi bruker ikke er null.
  // (hadde ikke vært mulig å komme seg hit hvis noe var null, men typescript er typescript)
  const addSplittingRequestToHistory = async () => {
    if (inndelingtype != null && kretser != null) {
      const { opprinneligKrets, nyeKretser } = getValues();
      const opprinneligKretsInfo = opprinneligFlateOptions?.find(
        (krets) => krets.id.lokalid.value === opprinneligKrets.lokalId,
      );
      const kommuneIdentifikator = kretser[0].kommuneIdentifikator;
      if (
        kommuneIdentifikator != null &&
        opprinneligKrets.lokalId.length > 0 &&
        nyeKretser.length > 0 &&
        opprinneligKretsInfo?.version != null
      ) {
        const exclusivelyNewKretser = nyeKretser.slice(1); // må fjerne opprinnelig krets her fordi vi har den i field
        const newKretsDelingEndringRequest = {
          opprinneligKrets: {
            lokalId: opprinneligKrets.lokalId,
            version: opprinneligKretsInfo.version,
          },
          kommuneId: kommuneIdentifikator,
          flatetype: inndelingtype,
          nyeKretser: exclusivelyNewKretser,
        };

        addHistoryEntry({
          type: "kretsdelingendring",
          changes: [
            {
              id: opprinneligKrets.lokalId,
              from: newKretsDelingEndringRequest,
              to: newKretsDelingEndringRequest,
            },
          ],
        });
        showSplittingSuccessToast(opprinneligKretsInfo, exclusivelyNewKretser);
      }
    }
  };

  const resetSplitting = () => {
    reset(getDefaultSplittingValue());
  };

  return {
    inndelingtype,
    opprinneligFlateOptions,
    fields,
    register,
    append,
    remove,
    resetSplitting,
    addSplittingRequestToHistory,
    setValue,
    getValues,
    handleOpprinneligKretsChange,
    handleSubmit,
    errors,
    trigger,
    isSubmitted,
  };
};
