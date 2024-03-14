import { deduplicate, removeNull } from "utils/list-utils";
import { KommuneResponse, StemmekretsResponse, UtkastOperasjoner } from "../../../types/api";
import {
  StemmekretsMetadataEndringstype,
  Endring,
  Stemmekretsendringer,
  StemmekretsMetadataEndring,
  StemmekretsSammenslaaingEndring,
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

export const getStemmekretserMedEndringer = (operasjoner: OperasjonerOrNull): string[] => {
  const endringerResponse = operasjoner?.metadataendringer?.stemmekretsendringer;

  if (!endringerResponse || !operasjoner) {
    return [];
  }

  const stemmekretserMedMetadataEndringer = removeNull(
    Object.keys(operasjoner?.metadataendringer?.stemmekretsendringer),
  );

  const viderefoertStemmekrets = operasjoner?.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets?.lokalId;

  const gamleKretser =
    operasjoner?.stemmekretsSammenslaaingsendring?.stemmekretserTilSammenslaaing.map((krets) => krets.lokalId) ?? [];

  const stemmekretserMedSammenslaaing = removeNull(gamleKretser.concat(viderefoertStemmekrets ?? []));

  const stemmekretserMedSplitting = operasjoner.kretsDelingEndringer
    .filter((splitting) => splitting.flatetype === KontekstType.STEMMEKRETS)
    .map((splitting) => splitting.opprinneligKrets.lokalId);

  const alleStemmekretserMedEndringer = getKretserMedGrensejusteringer(operasjoner, "STEMMEKRETS")
    .concat(stemmekretserMedMetadataEndringer)
    .concat(stemmekretserMedSammenslaaing)
    .concat(stemmekretserMedSplitting);

  return deduplicate(alleStemmekretserMedEndringer);
};

const getEndringAvTypeForId = (
  type: StemmekretsMetadataEndringstype,
  stemmekrets: string,
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
): Endring | null => {
  const gammelStemmekrets = findKrets(stemmekrets, alleStemmekretser);
  const nyVerdi = operasjoner.metadataendringer.stemmekretsendringer?.[stemmekrets]?.[type]?.trim();

  const gammelVerdi = gammelStemmekrets[type]?.trim() ?? "";

  if (!nyVerdi || gammelVerdi === nyVerdi) {
    return null;
  }

  return {
    fra: gammelVerdi,
    til: nyVerdi,
  };
};

const harMetadataEndring = (metadatEndring: StemmekretsMetadataEndring): boolean => {
  const fieldsToCheck = [
    metadatEndring.stemmekretsnavn,
    metadatEndring.stemmekretsnummer,
    metadatEndring.valgdistriktsnummer,
  ];

  return fieldsToCheck.some((field) => field !== null);
};

const getMetadataEndringer = (
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
): StemmekretsMetadataEndring[] => {
  return stemmekretser
    .map((stemmekretsId) => {
      const getEndringAvType = (type: StemmekretsMetadataEndringstype) =>
        getEndringAvTypeForId(type, stemmekretsId, operasjoner, alleStemmekretser);

      return {
        kretsEndret: findKrets(stemmekretsId, alleStemmekretser),
        stemmekretsnavn: getEndringAvType("stemmekretsnavn"),
        stemmekretsnummer: getEndringAvType("stemmekretsnummer"),
        valgdistriktsnummer: getEndringAvType("valgdistriktsnummer"),
      };
    })
    .filter(harMetadataEndring);
};

const getSammenslaaingEndring = (
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
): StemmekretsSammenslaaingEndring | null => {
  const viderefoertKrets = operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets;
  const stemmekretsMedSammenslaaing = viderefoertKrets?.lokalId;
  const sammenslaaing = operasjoner.stemmekretsSammenslaaingsendring;

  const harSammenslaaingsEndring =
    sammenslaaing &&
    viderefoertKrets &&
    stemmekretsMedSammenslaaing &&
    stemmekretser.includes(stemmekretsMedSammenslaaing);

  if (!harSammenslaaingsEndring) {
    return null;
  }

  const krets = findKrets(viderefoertKrets.lokalId, alleStemmekretser);

  const gamleKretser = sammenslaaing.stemmekretserTilSammenslaaing
    .map((gammelKrets) => findKrets(gammelKrets.lokalId, alleStemmekretser))
    .map((gammelKrets) => ({
      navn: gammelKrets.stemmekretsnavn,
      nummer: gammelKrets.stemmekretsnummer,
    }));

  return {
    viderefoertKrets: krets,
    nyttNavn: sammenslaaing.stemmekretsNavn ?? "",
    nyttNummer: sammenslaaing.stemmekretsNummer ?? "",
    gamleKretser,
  };
};

const getStemmekretsSplittingEndringer = (
  kommuneId: string | undefined,
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
): KretsSplittingEndring[] | null => {
  return operasjoner.kretsDelingEndringer
    .filter(
      (splitting) =>
        splitting.flatetype === KontekstType.STEMMEKRETS && splitting.kommuneId.lokalid.value === kommuneId,
    )
    .map((splitting) => {
      const opprinneligKrets = alleStemmekretser.find(
        (stemmekrets) => stemmekrets.id.lokalid.value === splitting.opprinneligKrets.lokalId,
      );

      const kretsSplittingEndring: KretsSplittingEndring = {
        opprinneligKrets: opprinneligKrets
          ? {
              kretsNavn: opprinneligKrets.stemmekretsnavn,
              kretsNummer: opprinneligKrets.stemmekretsnummer,
            }
          : { kretsNavn: "ukjent", kretsNummer: "ukjent" },
        nyeKretser: splitting.nyeKretser,
      };
      return kretsSplittingEndring;
    });
};

const getEndringerForKommune = (
  kommuneId: string,
  stemmekretserMedEndring: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
  alleKommuner: KommuneResponse[],
): Stemmekretsendringer => {
  const stemmekretserMedGrensejusteringer = getKretserMedGrensejusteringer(operasjoner, "STEMMEKRETS");

  const kommune = alleKommuner.find((kommuneRef) => kommuneRef.kommunenummer.id === kommuneId);

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      nummer: kommune?.kommunenummer.kodeverdi ?? "",
      navn: getNavnInSpraak(kommune?.administrativenhetnavn, "nor"),
    },
    metadataendringer: getMetadataEndringer(stemmekretserMedEndring, operasjoner, alleStemmekretser),
    grensejusteringer: removeNull(
      stemmekretserMedEndring
        .filter((id) => stemmekretserMedGrensejusteringer.includes(id))
        .map((stemmekretsId) => findKrets(stemmekretsId, alleStemmekretser)),
    ),
    sammenslaaing: getSammenslaaingEndring(stemmekretserMedEndring, operasjoner, alleStemmekretser),
    splitting: getStemmekretsSplittingEndringer(kommune?.id.lokalid.value, operasjoner, alleStemmekretser),
  };
};

export const getStemmekretsEndringer = (
  endredeStemmekretser: string[],
  operasjoner: OperasjonerOrNull,
  alleStemmekretser: StemmekretsResponse[],
  alleKommuner: KommuneResponse[],
): Stemmekretsendringer[] | null => {
  if (!operasjoner || endredeStemmekretser.length === 0) {
    return null;
  }

  const endredeStemmekretserGroupedBykommuneId = groupEndringerByKommune(endredeStemmekretser, alleStemmekretser);

  return Object.entries(endredeStemmekretserGroupedBykommuneId).map(([kommune, stemmekretser]) =>
    getEndringerForKommune(kommune, stemmekretser, operasjoner, alleStemmekretser, alleKommuner),
  );
};
