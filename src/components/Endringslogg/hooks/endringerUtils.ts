import { addToList, getUniqueItems, removeNil } from "utils/list-utils";
import {
  BopliktomraadeResponse,
  FeatureDTO,
  GrunnkretsRequest,
  GrunnkretsResponse,
  KommuneResponse,
  StemmekretsRequest,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import {
  Kretsendringer,
  KretsendringerForKommune,
  KretsSammenslaaingEndring,
  KretsSplittingEndring,
  Metadataendringer,
  OperasjonerOrNull,
  ResponseTypeFromInndelingtype,
  EndringsloggInndelingType,
  NyInndelingEndring,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { getNavnInSpraak, inndelingResponseNavnToString } from "utils/language/language";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import {
  getNonExhaustiveInndelingTypeFromRequest,
  isNonExhaustiveInndelingtype,
} from "pages/Kart/OverlayPanels/FlatedataPanel/flatedata-utils";
import { NonExhaustiveInndelingtype } from "pages/Kart/OverlayPanels/FlatedataPanel/FlatedataTable";

const getEndredeFeaturesForKretstype = (
  operasjoner: OperasjonerOrNull,
  inndelingType: EndringsloggInndelingType,
): FeatureDTO[] => {
  const endredeFeaturesMap = operasjoner?.grenseendringer?.endredeFeatures;

  if (!endredeFeaturesMap) {
    return [];
  }

  const endredeFeatures = removeNil(endredeFeaturesMap);

  return removeNil(
    endredeFeatures
      .filter((feature) => feature.properties.kontekstEgenskaper !== null)
      .filter((feature) => feature.properties.kontekstEgenskaper.some((kontekst) => kontekst.type === inndelingType)),
  );
};

const getKretserMedGrensejusteringer = (
  operasjoner: OperasjonerOrNull,
  inndelingType: EndringsloggInndelingType,
): string[] => {
  const endredeFeatures = getEndredeFeaturesForKretstype(operasjoner, inndelingType);
  return removeNil(
    getUniqueItems(
      endredeFeatures
        .flatMap((feature) => feature.properties.kontekstEgenskaper)
        .filter((kontekst) => kontekst.type === inndelingType)
        .map((kontekst) => kontekst.id?.lokalid.value),
    ),
  );
};

/**
 * Denne funksjonen tar inn et sett med endrede kretser og lager et map av endringene hvor de er gruppert per kommune.
 * Resultatet er da er Map med KommuneId som key og en liste an endrede stemmekretser som value.
 */

type groupEndringerByKommuneReturnType = { [kommuneid: string]: string[] };
function groupEndringerByKommune(
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

const groupNyeInndelingerByKommune = (
  alleKommuner: KommuneResponse[],
  operasjoner: UtkastOperasjoner,
  kretstype: EndringsloggInndelingType,
) => {
  return alleKommuner.reduce(
    (acc, kommune) => {
      if (!isNonExhaustiveInndelingtype(kretstype)) {
        return acc;
      }
      const nyeInndelingerForKommune = getNyeInndelingerForKommune(kommune.nummer, operasjoner, kretstype);
      if (nyeInndelingerForKommune.length > 0) {
        acc[kommune.id.lokalid.value] = nyeInndelingerForKommune;
      }
      return acc;
    },
    {} as { [kommuneId: string]: NyInndelingEndring[] },
  );
};

function findKrets<T extends StemmekretsResponse | GrunnkretsResponse>(id: string, kretser: T[]): T {
  const resultat = kretser.find((krets) => krets.id.lokalid.value === id);
  if (!resultat) {
    throw Error(
      `Kunne ikke finne krets med id: ${id}. Dette skal egentlig ikke skje, og kan tyde på feil i implementasjonen. Hvis feilen vedvarer, vennligst kontakt Kartverket.`,
    );
  }
  return resultat;
}

export const getKretserAvTypeMedEndringer = (
  operasjoner: OperasjonerOrNull,
  inndelingType: EndringsloggInndelingType,
): string[] => {
  if (operasjoner == null) {
    return [];
  }

  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, inndelingType);
  const kretserMedSammenslaaing = getKretserMedSammenslaaing(operasjoner, inndelingType);

  const kretserMedSplitting = operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === inndelingType)
    .map((splitting) => splitting.opprinneligKrets.lokalId);

  const alleKretserMedEndringer = getKretserMedGrensejusteringer(operasjoner, inndelingType)
    .concat(kretserMedMetadataEndringer)
    .concat(kretserMedSammenslaaing)
    .concat(kretserMedSplitting);

  return getUniqueItems(alleKretserMedEndringer);
};

const getKretserMedSammenslaaing = (
  operasjoner: UtkastOperasjoner,
  inndelingType: EndringsloggInndelingType,
): string[] => {
  if (inndelingType !== "STEMMEKRETS") {
    return [];
  }

  const gamleKretser =
    operasjoner.stemmekretsSammenslaaingsendring?.stemmekretserTilSammenslaaing.map((krets) => krets.lokalId) ?? [];
  const videreFoertKretsVedSammenSlaaing =
    operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets?.lokalId;

  return removeNil(gamleKretser.concat(videreFoertKretsVedSammenSlaaing ?? []));
};

const getKretserMedMetadataEndringer = (
  operasjoner: UtkastOperasjoner,
  inndelingType: EndringsloggInndelingType,
): string[] => {
  switch (inndelingType) {
    case "STEMMEKRETS":
      return removeNil(Object.keys(operasjoner.metadataendringer?.stemmekretsendringer ?? {}));
    case "GRUNNKRETS":
      return removeNil(Object.keys(operasjoner.metadataendringer?.grunnkretsendringer ?? {}));
    case "BOPLIKTOMRAADE":
      return removeNil(Object.keys(operasjoner.metadataendringer?.bopliktomraadeendringer ?? {}));
    default:
      return [];
  }
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

  const viderefoertKretResponse = findKrets(viderefoertKrets?.lokalId, alleStemmekretser);

  const gamleKretser = sammenslaaing.stemmekretserTilSammenslaaing
    .map((gammelKrets) => findKrets(gammelKrets.lokalId, alleStemmekretser))
    .map((gammelKrets) => ({
      navn: gammelKrets.navn,
      nummer: gammelKrets.nummer,
    }))
    .concat({
      navn: viderefoertKretResponse.navn,
      nummer: viderefoertKretResponse.nummer,
    });

  return {
    nyttNavn: sammenslaaing.navn,
    nyttNummer: sammenslaaing.nummer,
    gamleKretser,
  };
};

const getKretsdelinger = (
  kommuneId: string | undefined,
  operasjoner: UtkastOperasjoner,
  alleKretser: (StemmekretsResponse | GrunnkretsResponse)[],
  inndelingType: EndringsloggInndelingType,
): KretsSplittingEndring[] | null => {
  return operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === inndelingType && splitting.kommuneId.lokalid.value === kommuneId)
    .map((splitting) => {
      const opprinneligKretsResponse = alleKretser.find(
        (krets) => krets.id.lokalid.value === splitting.opprinneligKrets.lokalId,
      );

      const opprinneligKrets = {
        kretsNummer: opprinneligKretsResponse?.nummer ?? "XX",
        kretsNavn: opprinneligKretsResponse?.navn ?? "Ukjent",
      };

      const kretsSplittingEndring: KretsSplittingEndring = {
        opprinneligKrets: opprinneligKrets,
        nyeKretser: splitting.nyeKretser.concat(opprinneligKrets),
      };
      return kretsSplittingEndring;
    });
};

const getNyeInndelingerForKommune = (
  kommunenummer: string | undefined,
  operasjoner: UtkastOperasjoner,
  inndelingType: NonExhaustiveInndelingtype,
): NyInndelingEndring[] => {
  return operasjoner.createInndelingEndringer
    .filter(
      (inndeling) =>
        getNonExhaustiveInndelingTypeFromRequest(inndeling) === inndelingType &&
        inndeling.kommunenummer?.kodeverdi === kommunenummer,
    )
    .map((inndeling) => ({
      navn: inndeling.navn,
      nummer: inndeling.nummer,
      inndelingtype: inndelingType,
    }));
};

const erKretsIKommune = (
  kretsId: string,
  kommuneId: string | undefined,
  alleKretser: (StemmekretsResponse & GrunnkretsResponse)[],
): boolean => {
  const kretsResponse = alleKretser.find((response) => response.id.lokalid.value === kretsId);
  return kretsResponse?.kommuneIdentifikator.lokalid.value === kommuneId;
};

const getKretsendringerForKretstype = (
  inndelingType: EndringsloggInndelingType,
  operasjoner: UtkastOperasjoner,
): { [lokalid: string]: GrunnkretsRequest | StemmekretsRequest } | undefined => {
  switch (inndelingType) {
    case "GRUNNKRETS":
      return operasjoner.metadataendringer.grunnkretsendringer;
    case "STEMMEKRETS":
      return operasjoner.metadataendringer.stemmekretsendringer;
    case "BOPLIKTOMRAADE":
      return operasjoner.metadataendringer.bopliktomraadeendringer;
    default:
      return undefined;
  }
};

const getMetadataEndringer = (
  kommuneId: string | undefined,
  inndelingType: EndringsloggInndelingType,
  operasjoner: UtkastOperasjoner,
  alleKretser: GrunnkretsResponse[],
): Metadataendringer[] => {
  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, inndelingType).filter((kretsId) =>
    erKretsIKommune(kretsId, kommuneId, alleKretser),
  );
  const kretsendringer = getKretsendringerForKretstype(inndelingType, operasjoner);

  return kretserMedMetadataEndringer.map((krets) => {
    const oppinneligKrets = findKrets(krets, alleKretser);
    return {
      kretsType: inndelingType,
      opprinneligKrets: {
        navn: oppinneligKrets.navn,
        nummer: oppinneligKrets.nummer,
      },
      navn: kretsendringer?.[krets]?.navn?.trim(),
      nummer: kretsendringer?.[krets]?.nummer?.trim(),
    };
  });
};

export const getSamiskforvaltningsomraadednring = (
  kommuneId: string,
  operasjoner: UtkastOperasjoner,
  alleKommuner: KommuneResponse[] | null | undefined,
): boolean | undefined => {
  if (alleKommuner == null) {
    return undefined;
  }

  const endringForKommune = operasjoner.metadataendringer.kommuneendringer[kommuneId];
  const kommune = alleKommuner.find((k) => k.id.lokalid.value === kommuneId);

  if (endringForKommune == null || kommune == null) {
    return undefined;
  }

  if (kommune.samiskforvaltningsomraade === endringForKommune.samiskforvaltningsomraade) {
    return undefined;
  }

  return endringForKommune.samiskforvaltningsomraade;
};

export const getNavnendringForKommune = (
  kommuneId: string,
  operasjoner: UtkastOperasjoner,
  alleKommuner: KommuneResponse[] | undefined | null,
): string | undefined => {
  if (alleKommuner == null) {
    return undefined;
  }

  const endringForKommune = operasjoner.metadataendringer.kommuneendringer[kommuneId];
  const kommune = alleKommuner.find((k) => k.id.lokalid.value === kommuneId);

  if (endringForKommune == null || kommune == null) {
    return undefined;
  }

  const oldName = inndelingResponseNavnToString(kommune.navn);
  const newName = inndelingResponseNavnToString(endringForKommune.administrativenhetnavn);

  if (oldName === newName) {
    return undefined;
  }

  return newName;
};

const getEndringerForKommune = <T extends EndringsloggInndelingType>(
  kommuneId: string,
  kretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleKretser: ResponseTypeFromInndelingtype<T>[],
  alleKommuner: KommuneResponse[],
  kretstype: T,
): KretsendringerForKommune => {
  const endredeFeatures = getEndredeFeaturesForKretstype(operasjoner, kretstype).filter((feature) =>
    feature.properties.kontekstEgenskaper.some((kontekst) => kontekst.kommuneId?.lokalid.value === kommuneId),
  );

  const antallArkiverteGrenser = endredeFeatures.filter((feature) => feature.properties.shouldArchive).length;
  const antallNyeGrenser = endredeFeatures.filter(
    (feature) => feature.id == null || isTempFeatureId(feature.id),
  ).length;
  const antallEndredeGrenser = endredeFeatures.length - (antallArkiverteGrenser + antallNyeGrenser);

  const kommune = alleKommuner.find((kommuneResponse) => kommuneResponse.id.lokalid.value === kommuneId);

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      nummer: kommune?.nummer ?? "",
      navn: getNavnInSpraak(kommune?.navn, "nor"),
    },
    metadataendringer: getMetadataEndringer(kommune?.id.lokalid.value, kretstype, operasjoner, alleKretser),
    antallEndredeGrenser,
    antallArkiverteGrenser,
    antallNyeGrenser,
    sammenslaaing: getSammenslaaingEndring(kretserMedEndringer, operasjoner, alleKretser),
    delinger: getKretsdelinger(kommune?.id.lokalid.value, operasjoner, alleKretser, kretstype),
    nyeInndelinger: isNonExhaustiveInndelingtype(kretstype)
      ? getNyeInndelingerForKommune(kommune?.nummer, operasjoner, kretstype)
      : [],
  };
};

export const getGrenseendringerUtenTilhorighet = (operasjoner: UtkastOperasjoner): Kretsendringer => {
  const featuresUtenTilhorighet = operasjoner.grenseendringer.endredeFeatures.filter(
    (feature) => feature.properties.kontekstEgenskaper.length === 0,
  );

  const antallNyeGrenser = featuresUtenTilhorighet.filter((feature) => feature.id == null).length;
  const antallEndredeGrenser = featuresUtenTilhorighet.filter((feature) => feature.id != null).length;

  return {
    metadataendringer: [],
    antallEndredeGrenser,
    antallArkiverteGrenser: 0,
    antallNyeGrenser,
    sammenslaaing: null,
    delinger: null,
    nyeInndelinger: [],
  };
};

export const getStemmekretsEndringer = (
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: StemmekretsResponse[],
  alleKommuner: KommuneResponse[],
): KretsendringerForKommune[] | null => {
  return getKretsEndringer(endredeKretser, operasjoner, alleKretser, alleKommuner, "STEMMEKRETS");
};

export const getGrunnkretsEndringer = (
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: GrunnkretsResponse[],
  alleKommuner: KommuneResponse[],
): KretsendringerForKommune[] | null => {
  return getKretsEndringer(endredeKretser, operasjoner, alleKretser, alleKommuner, "GRUNNKRETS");
};

export const getBopliktomraadeEndringer = (
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: BopliktomraadeResponse[],
  alleKommuner: KommuneResponse[],
): KretsendringerForKommune[] | null => {
  return getKretsEndringer(endredeKretser, operasjoner, alleKretser, alleKommuner, "BOPLIKTOMRAADE");
};

const getKretsEndringer = <T extends EndringsloggInndelingType>(
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: ResponseTypeFromInndelingtype<T>[],
  alleKommuner: KommuneResponse[],
  kretstype: T,
): KretsendringerForKommune[] | null => {
  if (!operasjoner) {
    return null;
  }

  const endredeKretserGroupedByKommuneId = groupEndringerByKommune(endredeKretser, alleKretser);
  const nyeInndelingerGroupedByKommuneId = groupNyeInndelingerByKommune(alleKommuner, operasjoner, kretstype);

  const kommuneIds = [
    ...Object.keys(endredeKretserGroupedByKommuneId),
    ...Object.keys(nyeInndelingerGroupedByKommuneId),
  ];

  return kommuneIds.map((kommuneId) =>
    getEndringerForKommune(
      kommuneId,
      endredeKretserGroupedByKommuneId[kommuneId] ?? [],
      operasjoner,
      alleKretser,
      alleKommuner,
      kretstype,
    ),
  );
};
