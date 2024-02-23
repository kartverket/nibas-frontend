import { GrunnkretsResponse, KommuneRef, UtkastOperasjoner } from "../../../types/api";
import { deduplicate, removeNull } from "utils/list-utils";
import {
  GrunnkretsEndringstype,
  Grunnkretsendringer,
  GrunnkretsMetadataEndring,
  Endring,
  KretsDelingEndring,
} from "./utkastEndringerTypes";
import {
  findKrets,
  getKretserMedGrensejusteringer,
  groupEndringerByKommune,
  OperasjonerOrNull,
} from "./endringerUtils";
import { getNavnInSpraak } from "utils/language/language";

export const getGrunnkretserMedEndringer = (operasjoner: OperasjonerOrNull): string[] => {
  const endringerResponse = operasjoner?.metadataendringer?.grunnkretsendringer;

  if (endringerResponse == null && operasjoner == null) {
    return [];
  }

  const grunnkretsMetadataEndringer = removeNull(
    Object.keys(operasjoner?.metadataendringer?.grunnkretsendringer ?? {}),
  );

  const alleGrunnkretserMedEndringer = getKretserMedGrensejusteringer(operasjoner, "GRUNNKRETS").concat(
    grunnkretsMetadataEndringer,
  );

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
  return fieldsToCheck.some((field) => field != null);
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

const getGrunnkretsDelingEndringer = (
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: GrunnkretsResponse[],
): KretsDelingEndring[] | null => {
  return operasjoner.kretsDelingEndringer.map((deling) => {
    const opprinneligKrets = alleStemmekretser.find(
      (stemmekrets) => stemmekrets.id.lokalid.value === deling.opprinneligKrets.lokalId,
    );

    return {
      opprinneligKrets: opprinneligKrets
        ? {
            kretsNavn: opprinneligKrets.navn,
            kretsNummer: opprinneligKrets.grunnkretsnummer,
          }
        : null,
      nyeKretser: deling.nyeKretser,
    } as KretsDelingEndring;
  });
};

const getEndringerForKommune = (
  kommuneId: string,
  grunnkretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneRef[],
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
    delinger: getGrunnkretsDelingEndringer(operasjoner, alleGrunnkretser),
  };
};

export const getGrunnkretsEndringer = (
  endredeGrunnkretser: string[],
  operasjoner: OperasjonerOrNull,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneRef[],
): Grunnkretsendringer[] | null => {
  if (operasjoner == null || endredeGrunnkretser.length == 0) {
    return null;
  }

  const endredeGrunnkretserGroupedBykommuneId = groupEndringerByKommune(endredeGrunnkretser, alleGrunnkretser);

  return Object.entries(endredeGrunnkretserGroupedBykommuneId).map(([kommune, stemmekretser]) =>
    getEndringerForKommune(kommune, stemmekretser, operasjoner, alleGrunnkretser, alleKommuner),
  );
};
