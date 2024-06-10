import { addToList, getUniqueItems, removeNil } from "utils/list-utils";
import {
  FeatureDTO,
  GrunnkretsRequest,
  GrunnkretsResponse,
  KommuneResponse,
  StemmekretsRequest,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import {
  KretsendringerForKommune,
  KretsSammenslaaingEndring,
  KretsSplittingEndring,
  Metadataendringer,
  OperasjonerOrNull,
  ResponseTypeFromKretstype,
} from "components/Endringslogg/hooks/utkastEndringerTypes";
import { getNavnInSpraak, inndelingResponseNavnToString } from "utils/language/language";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";

const getEndredeFeaturesForKretstype = (operasjoner: OperasjonerOrNull, kretstype: KontekstType): FeatureDTO[] => {
  const endredeFeaturesMap = operasjoner?.grenseendringer?.endredeFeatures;

  if (!endredeFeaturesMap) {
    return [];
  }

  const endredeFeatures = removeNil(endredeFeaturesMap);

  return removeNil(
    endredeFeatures
      .filter((feature) => feature.properties.kontekstEgenskaper !== null)
      .filter((feature) => feature.properties.kontekstEgenskaper.some((kontekst) => kontekst.type === kretstype)),
  );
};

const getKretserMedGrensejusteringer = (operasjoner: OperasjonerOrNull, kretstype: KontekstType): string[] => {
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

function findKrets<T extends StemmekretsResponse | GrunnkretsResponse>(id: string, kretser: T[]): T {
  const resultat = kretser.find((krets) => krets.id.lokalid.value === id);
  if (!resultat) {
    throw Error(
      `Kunne ikke finne krets med id: ${id}. Dette skal egentlig ikke skje, og kan tyde på feil i implementasjonen. Hvis feilen vedvarer, vennligst kontakt Kartverket.`,
    );
  }
  return resultat;
}

export const getKretserAvTypeMedEndringer = (operasjoner: OperasjonerOrNull, kretsType: KontekstType): string[] => {
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

const getKretserMedSammenslaaing = (operasjoner: UtkastOperasjoner, kretsType: KontekstType): string[] => {
  if (kretsType === KontekstType.GRUNNKRETS) {
    // Vi har ikke støtte for sammenslåing av grunnkretser per dags dato
    return [];
  }

  const gamleKretser =
    operasjoner.stemmekretsSammenslaaingsendring?.stemmekretserTilSammenslaaing.map((krets) => krets.lokalId) ?? [];
  const videreFoertKretsVedSammenSlaaing =
    operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets?.lokalId;

  return removeNil(gamleKretser.concat(videreFoertKretsVedSammenSlaaing ?? []));
};

const getKretserMedMetadataEndringer = (operasjoner: UtkastOperasjoner, kretsType: KontekstType): string[] => {
  const metadataEndringer =
    kretsType === KontekstType.STEMMEKRETS
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
  kretsType: KontekstType,
): KretsSplittingEndring[] | null => {
  return operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === kretsType && splitting.kommuneId.lokalid.value === kommuneId)
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

const erKretsIKommune = (
  kretsId: string,
  kommuneId: string | undefined,
  alleKretser: (StemmekretsResponse & GrunnkretsResponse)[],
): boolean => {
  const kretsResponse = alleKretser.find((response) => response.id.lokalid.value === kretsId);
  return kretsResponse?.kommuneIdentifikator.lokalid.value === kommuneId;
};

const getKretsendringerForKretstype = (
  kretsType: KontekstType,
  operasjoner: UtkastOperasjoner,
): { [lokalid: string]: GrunnkretsRequest | StemmekretsRequest } | undefined => {
  switch (kretsType) {
    case KontekstType.GRUNNKRETS:
      return operasjoner.metadataendringer.grunnkretsendringer;
    case KontekstType.STEMMEKRETS:
      return operasjoner.metadataendringer.stemmekretsendringer;
    default:
      return undefined;
  }
};

const getMetadataEndringer = (
  kommuneId: string | undefined,
  kretsType: KontekstType,
  operasjoner: UtkastOperasjoner,
  alleKretser: GrunnkretsResponse[],
): Metadataendringer[] => {
  const kretserMedMetadataEndringer = getKretserMedMetadataEndringer(operasjoner, kretsType).filter((kretsId) =>
    erKretsIKommune(kretsId, kommuneId, alleKretser),
  );
  const kretsendringer = getKretsendringerForKretstype(kretsType, operasjoner);

  return kretserMedMetadataEndringer.map((krets) => {
    const oppinneligKrets = findKrets(krets, alleKretser);
    return {
      kretsType: kretsType,
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

const getEndringerForKommune = <T extends KontekstType>(
  kommuneId: string,
  kretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleKretser: ResponseTypeFromKretstype<T>[],
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
  };
};

export const getStemmekretsEndringer = (
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: StemmekretsResponse[],
  alleKommuner: KommuneResponse[],
): KretsendringerForKommune[] | null => {
  return getKretsEndringer(endredeKretser, operasjoner, alleKretser, alleKommuner, KontekstType.STEMMEKRETS);
};

export const getGrunnkretsEndringer = (
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: GrunnkretsResponse[],
  alleKommuner: KommuneResponse[],
): KretsendringerForKommune[] | null => {
  return getKretsEndringer(endredeKretser, operasjoner, alleKretser, alleKommuner, KontekstType.GRUNNKRETS);
};

const getKretsEndringer = <T extends KontekstType>(
  endredeKretser: string[],
  operasjoner: OperasjonerOrNull,
  alleKretser: ResponseTypeFromKretstype<T>[],
  alleKommuner: KommuneResponse[],
  kretstype: T,
): KretsendringerForKommune[] | null => {
  if (!operasjoner || endredeKretser.length === 0) {
    return null;
  }

  const endredeKretserGroupedByKommuneId = groupEndringerByKommune(endredeKretser, alleKretser);

  return Object.entries(endredeKretserGroupedByKommuneId).map(([kommune, kretser]) =>
    getEndringerForKommune(kommune, kretser, operasjoner, alleKretser, alleKommuner, kretstype),
  );
};
