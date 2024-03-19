import { GrunnkretsResponse, KommuneResponse, UtkastOperasjoner } from "../../../types/api";
import { deduplicate, removeNull } from "utils/list-utils";
import {
  GrunnkretsEndringstype,
  Grunnkretsendringer,
  GrunnkretsMetadataEndring,
  Endring,
  KretsSplittingEndring,
} from "./utkastEndringerTypes";
import {
  findKrets,
  getKretserMedGrensejusteringer,
  groupEndringerByKommune,
  OperasjonerOrNull,
} from "./endringer-utils";
import { getNavnInSpraak } from "utils/language/language";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

export const getGrunnkretserMedEndringer = (operasjoner: OperasjonerOrNull): string[] => {
  const endringerResponse = operasjoner?.metadataendringer?.grunnkretsendringer;

  if (endringerResponse == null || operasjoner == null) {
    return [];
  }

  const grunnkretsMetadataEndringer = removeNull(
    Object.keys(operasjoner?.metadataendringer?.grunnkretsendringer ?? {}),
  );

  const grunnkretserMedSplitting = operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === KontekstType.GRUNNKRETS)
    .map((splitting) => splitting.opprinneligKrets.lokalId);

  const alleGrunnkretserMedEndringer = getKretserMedGrensejusteringer(operasjoner, "GRUNNKRETS")
    .concat(grunnkretsMetadataEndringer)
    .concat(grunnkretserMedSplitting);

  return deduplicate(alleGrunnkretserMedEndringer);
};

const getEndringAvTypeForId = (
  type: GrunnkretsEndringstype,
  grunnkretsId: string,
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
): Endring | null => {
  const gammelGrunnkrets = findKrets(grunnkretsId, alleGrunnkretser);
  const nyVerdi = operasjoner.metadataendringer.grunnkretsendringer?.[grunnkretsId]?.[type]?.trim();

  const gammelVerdi = gammelGrunnkrets[type]?.trim() ?? "";

  if (gammelVerdi === nyVerdi || nyVerdi == null) {
    return null;
  }

  return {
    fra: gammelVerdi,
    til: nyVerdi,
  };
};

const harMetadataEndring = (metadatEndring: GrunnkretsMetadataEndring): boolean => {
  const fieldsToCheck = [metadatEndring.navn, metadatEndring.grunnkretsnummer];
  return fieldsToCheck.some((field) => field !== null);
};

const getMetadataEndringer = (
  grunnkretser: string[],
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
): GrunnkretsMetadataEndring[] => {
  return grunnkretser
    .map((grunnkretsId) => {
      const getEndringAvType = (type: GrunnkretsEndringstype) =>
        getEndringAvTypeForId(type, grunnkretsId, operasjoner, alleGrunnkretser);

      return {
        kretsEndret: findKrets(grunnkretsId, alleGrunnkretser),
        navn: getEndringAvType("navn"),
        grunnkretsnummer: getEndringAvType("grunnkretsnummer"),
      };
    })
    .filter(harMetadataEndring);
};

const getGrunnkretsSplittingEndringer = (
  kommuneId: string | undefined,
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
): KretsSplittingEndring[] | null => {
  return operasjoner.kretsDelingEndringer
    .filter(
      (splitting) => splitting.flatetype === KontekstType.GRUNNKRETS && splitting.kommuneId.lokalid.value === kommuneId,
    )
    .map((splitting) => {
      const opprinneligKrets = alleGrunnkretser.find(
        (grunnkrets) => grunnkrets.id.lokalid.value === splitting.opprinneligKrets.lokalId,
      );

      const kretsSplittingEndring: KretsSplittingEndring = {
        opprinneligKrets: opprinneligKrets
          ? {
              kretsNavn: opprinneligKrets.navn,
              kretsNummer: opprinneligKrets.grunnkretsnummer,
            }
          : { kretsNavn: "ukjent", kretsNummer: "ukjent" },
        nyeKretser: splitting.nyeKretser,
      };

      return kretsSplittingEndring;
    });
};

const getEndringerForKommune = (
  kommuneId: string,
  grunnkretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneResponse[],
): Grunnkretsendringer => {
  const grunnkretserMedGrensejusteringer = getKretserMedGrensejusteringer(operasjoner, "GRUNNKRETS");

  const kommune = alleKommuner.find((kommuneRef) => kommuneRef.kommunenummer.id === kommuneId);

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      nummer: kommune?.kommunenummer.kodeverdi ?? "",
      navn: getNavnInSpraak(kommune?.navn, "nor"),
    },
    metadataendringer: getMetadataEndringer(grunnkretserMedEndringer, operasjoner, alleGrunnkretser),
    grensejusteringer: removeNull(
      grunnkretserMedEndringer
        .filter((id) => grunnkretserMedGrensejusteringer.includes(id))
        .map((grunnkretsId) => findKrets(grunnkretsId, alleGrunnkretser)),
    ),
    splittinger: getGrunnkretsSplittingEndringer(kommune?.id.lokalid.value, operasjoner, alleGrunnkretser),
  };
};

export const getGrunnkretsEndringer = (
  endredeGrunnkretser: string[],
  operasjoner: OperasjonerOrNull,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneResponse[],
): Grunnkretsendringer[] | null => {
  if (!operasjoner || endredeGrunnkretser.length === 0) {
    return null;
  }

  const endredeGrunnkretserGroupedBykommuneId = groupEndringerByKommune(endredeGrunnkretser, alleGrunnkretser);

  return Object.entries(endredeGrunnkretserGroupedBykommuneId).map(([kommune, stemmekretser]) =>
    getEndringerForKommune(kommune, stemmekretser, operasjoner, alleGrunnkretser, alleKommuner),
  );
};
