import { addToList, getUniqueItems, removeNil } from "utils/list-utils";
import {
  FeatureDTO,
  GrunnkretsResponse,
  KommuneResponse,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import {
  Endring,
  GrunnkretsMetadataFields,
  Kretsendringer,
  KretsSammenslaaingEndring,
  KretsSplittingEndring,
  KretsType,
  Metadataendringer,
  ResponseTypeFromKretstype,
  StemmekretsMetadataFields,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { getNavnInSpraak } from "utils/language/language";

export type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export const getEndredeFeaturesForKretstype = (operasjoner: OperasjonerOrNull, kretstype: KretsType): FeatureDTO[] => {
  const endredeFeaturesMap = operasjoner?.grenseendringer?.endredeFeatures;

  if (!endredeFeaturesMap) {
    return [];
  }

  const endredeFeatures = removeNil(Object.values(endredeFeaturesMap));

  return removeNil(
    endredeFeatures
      .filter((feature) => feature.properties.kontekstEgenskaper !== null)
      .filter((feature) => feature.properties.kontekstEgenskaper.some((kontekst) => kontekst.type === kretstype)),
  );
};

export const getKretserMedGrensejusteringer = <T extends KretsType>(
  operasjoner: OperasjonerOrNull,
  kretstype: T,
): string[] => {
  const endredeFeatures = getEndredeFeaturesForKretstype(operasjoner, kretstype);
  return removeNil(
    getUniqueItems(
      endredeFeatures
        .flatMap((feature) => feature.properties.kontekstEgenskaper)
        .filter((kontekst) => kontekst.type === kretstype)
        .map((kontekst) => kontekst.id?.lokalid.value),
    ),
  );
};

/**
 * Denne funksjonen tar inn et sett med endrede stemmekretser og lager et map av endringene hvor de er gruppert per kommune.
 * Resultatet er da er Map med KommuneId som key og en liste an endrede stemmekretser som value.
 */

type groupEndringerByKommuneReturnType = { [kommuneid: string]: string[] };
export function groupEndringerByKommune(
  endredeKretser: string[],
  alleKretser: (StemmekretsResponse | GrunnkretsResponse)[],
): groupEndringerByKommuneReturnType {
  return endredeKretser
    .map((kretsId) => {
      const krets = alleKretser.find((s) => s.id.lokalid.value === kretsId);
      return [kretsId, krets?.kommuneIdentifikator.lokalid.value];
    })
    .reduce((acc: { [key: string]: string[] }, [stemmekretsid, kommune]) => {
      if (kommune == null) {
        return acc;
      }
      return { ...acc, [kommune]: addToList(stemmekretsid, acc[kommune]) };
    }, {});
}

export function findKrets<T extends StemmekretsResponse | GrunnkretsResponse>(id: string, kretser: T[]): T {
  const resultat = kretser.find((krets) => krets.id.lokalid.value === id);
  if (!resultat) {
    throw Error(
      `Kunne ikke finne krets med id: ${id}. Dette skal egentlig ikke skje, og kan tyde på feil i implementasjonen. Gjerne ta kontakt med Team Smia om feilen vedvarer.`,
    );
  }
  return resultat;
}

export const getKretserAvTypeMedEndringer = (operasjoner: OperasjonerOrNull, kretsType: KretsType): string[] => {
  if (operasjoner == null) {
    return [];
  }

  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, kretsType);
  const kretserMedSammenslaaing = getKretserMedSammenslaaing(operasjoner, kretsType);

  const kretserMedSplitting = operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === kretsType)
    .map((splitting) => splitting.opprinneligKrets.lokalId);

  const alleKretserMedEndringer = getKretserMedGrensejusteringer(operasjoner, kretsType)
    .concat(kretserMedMetadataEndringer)
    .concat(kretserMedSammenslaaing)
    .concat(kretserMedSplitting);

  return getUniqueItems(alleKretserMedEndringer);
};

const getKretserMedSammenslaaing = <T extends KretsType>(operasjoner: UtkastOperasjoner, kretsType: T): string[] => {
  if (kretsType === "GRUNNKRETS") {
    // Vi har ikke støtte for sammenslåing av grunnkretser per dags dato
    return [];
  }

  const gamleKretser =
    operasjoner.stemmekretsSammenslaaingsendring?.stemmekretserTilSammenslaaing.map((krets) => krets.lokalId) ?? [];
  const videreFoertKretsVedSammenSlaaing =
    operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets?.lokalId;

  return removeNil(gamleKretser.concat(videreFoertKretsVedSammenSlaaing ?? []));
};

const getKretserMedMetadataEndringer = <T extends KretsType>(
  operasjoner: UtkastOperasjoner,
  kretsType: T,
): string[] => {
  const metadataEndringer =
    kretsType === "STEMMEKRETS"
      ? operasjoner.metadataendringer?.stemmekretsendringer
      : operasjoner.metadataendringer?.grunnkretsendringer;

  return removeNil(Object.keys(metadataEndringer));
};

const getSammenslaaingEndring = (
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
): KretsSammenslaaingEndring | null => {
  const viderefoertKrets = operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets;
  const stemmekretsMedSammenslaaing = viderefoertKrets?.lokalId;
  const sammenslaaing = operasjoner.stemmekretsSammenslaaingsendring;

  const harSammenslaaingsEndring =
    sammenslaaing != null &&
    viderefoertKrets != null &&
    stemmekretsMedSammenslaaing != null &&
    stemmekretser.includes(stemmekretsMedSammenslaaing);

  if (!harSammenslaaingsEndring) {
    return null;
  }

  const gamleKretser = sammenslaaing.stemmekretserTilSammenslaaing
    .map((gammelKrets) => findKrets(gammelKrets.lokalId, alleStemmekretser))
    .map((gammelKrets) => ({
      navn: gammelKrets.navn,
      nummer: gammelKrets.nummer,
    }));

  return {
    nyttNavn: sammenslaaing.navn ?? "",
    nyttNummer: sammenslaaing.nummer ?? "",
    gamleKretser,
  };
};

const getKretsdelinger = (
  kommuneId: string | undefined,
  operasjoner: UtkastOperasjoner,
  alleKretser: (StemmekretsResponse | GrunnkretsResponse)[],
  kretsType: KretsType,
): KretsSplittingEndring[] | null => {
  return operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === kretsType && splitting.kommuneId.lokalid.value === kommuneId)
    .map((splitting) => {
      const opprinneligKrets = alleKretser.find(
        (krets) => krets.id.lokalid.value === splitting.opprinneligKrets.lokalId,
      );

      const kretsSplittingEndring: KretsSplittingEndring = {
        opprinneligKrets: opprinneligKrets
          ? {
              kretsNavn: opprinneligKrets.navn,
              kretsNummer: opprinneligKrets.nummer,
            }
          : { kretsNavn: "ukjent", kretsNummer: "ukjent" },
        nyeKretser: splitting.nyeKretser,
      };
      return kretsSplittingEndring;
    });
};

const getEndringAvTypeForStemmekrets = (
  endringstype: StemmekretsMetadataFields,
  kretsnummer: string,
  operasjoner: UtkastOperasjoner,
  alleKretser: StemmekretsResponse[],
): Endring | null => {
  const gammelKrets = findKrets(kretsnummer, alleKretser);
  const nyVerdi = operasjoner.metadataendringer.stemmekretsendringer?.[kretsnummer]?.[endringstype]?.trim();

  const gammelVerdi = gammelKrets[endringstype]?.trim() ?? "";

  if (nyVerdi == null || gammelVerdi === nyVerdi) {
    return null;
  }

  return {
    fra: gammelVerdi,
    til: nyVerdi,
  };
};

const getEndringAvTypeForGrunnkrets = (
  endringstype: GrunnkretsMetadataFields,
  kretsnummer: string,
  operasjoner: UtkastOperasjoner,
  alleKretser: GrunnkretsResponse[],
): Endring | null => {
  const gammelKrets = findKrets(kretsnummer, alleKretser);
  const nyVerdi = operasjoner.metadataendringer.grunnkretsendringer?.[kretsnummer]?.[endringstype]?.trim();

  const gammelVerdi = gammelKrets[endringstype]?.trim() ?? "";

  if (nyVerdi == null || gammelVerdi === nyVerdi) {
    return null;
  }

  return {
    fra: gammelVerdi,
    til: nyVerdi,
  };
};

const getMetadataEndringerForStemmekrets = (
  operasjoner: UtkastOperasjoner,
  alleKretser: StemmekretsResponse[],
): Metadataendringer<"STEMMEKRETS">[] => {
  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, "STEMMEKRETS");
  return kretserMedMetadataEndringer.map((krets) => ({
    valgdistriktsnummer: getEndringAvTypeForStemmekrets("valgdistriktsnummer", krets, operasjoner, alleKretser),
    navn: getEndringAvTypeForStemmekrets("navn", krets, operasjoner, alleKretser),
    nummer: getEndringAvTypeForStemmekrets("nummer", krets, operasjoner, alleKretser),
  }));
};

const getMetadataEndringerForGrunnkrets = (
  operasjoner: UtkastOperasjoner,
  alleKretser: GrunnkretsResponse[],
): Metadataendringer<"GRUNNKRETS">[] => {
  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, "GRUNNKRETS");
  return kretserMedMetadataEndringer.map((krets) => ({
    navn: getEndringAvTypeForGrunnkrets("navn", krets, operasjoner, alleKretser),
    nummer: getEndringAvTypeForGrunnkrets("nummer", krets, operasjoner, alleKretser),
  }));
};

function getMetadataEndringer<T extends KretsType>(
  operasjoner: UtkastOperasjoner,
  alleKretser: ResponseTypeFromKretstype<T>[],
  kretstype: T,
): Metadataendringer<T>[] {
  switch (kretstype) {
    case "GRUNNKRETS":
      // Typescript forstår ikke at T alltid er "GRUNNKRETS" her så må caste
      return getMetadataEndringerForGrunnkrets(operasjoner, alleKretser) as Metadataendringer<T>[];
    case "STEMMEKRETS":
      // Typescript forstår ikke at T alltid er "STEMMEKRETS" her så må caste
      return getMetadataEndringerForStemmekrets(operasjoner, alleKretser) as Metadataendringer<T>[];
    default:
      return [];
  }
}

const getEndringerForKommune = <T extends KretsType>(
  kommuneId: string,
  kretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleKretser: ResponseTypeFromKretstype<T>[],
  alleKommuner: KommuneResponse[],
  kretstype: T,
): Kretsendringer<T> => {
  const endredeFeatures = getEndredeFeaturesForKretstype(operasjoner, kretstype).filter((feature) =>
    feature.properties.kontekstEgenskaper.some((kontekst) => kontekst.kommuneId?.lokalid.value === kommuneId),
  );

  const antallArkiverteGrenser = endredeFeatures.filter((feature) => feature.properties.shouldArchive).length;
  const antallNyeGrenser = endredeFeatures.filter((feature) => feature.id == null).length;
  const antallEndredeGrenser = endredeFeatures.length - (antallArkiverteGrenser + antallNyeGrenser);

  const kommune = alleKommuner.find((kommuneResponse) => kommuneResponse.id.lokalid.value === kommuneId);

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      nummer: kommune?.nummer ?? "",
      navn: getNavnInSpraak(kommune?.navn, "nor"),
    },
    metadataendringer: getMetadataEndringer(operasjoner, alleKretser, kretstype),
    antallEndredeGrenser,
    antallArkiverteGrenser,
    antallNyeGrenser,
    sammenslaaing: getSammenslaaingEndring(kretserMedEndringer, operasjoner, alleKretser),
    delinger: getKretsdelinger(kommune?.id.lokalid.value, operasjoner, alleKretser, kretstype),
  };
};

export const getKretsEndringer = <T extends KretsType>(
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: ResponseTypeFromKretstype<T>[],
  alleKommuner: KommuneResponse[],
  kretstype: T,
): Kretsendringer<T>[] | null => {
  if (!operasjoner || endredeKretser.length === 0) {
    return null;
  }

  const endredeKretserGroupedBykommuneId = groupEndringerByKommune(endredeKretser, alleKretser);

  return Object.entries(endredeKretserGroupedBykommuneId).map(([kommune, kretser]) =>
    getEndringerForKommune(kommune, kretser, operasjoner, alleKretser, alleKommuner, kretstype),
  );
};
