import {
  KommuneRef,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import { deduplicate, removeNull } from "utils/list-utils";
import {
  StemmekretsMetadataEndringstype,
  Endring,
  Stemmekretsendringer,
  StemmekretsMetadataEndring,
  StemmekretsSammenslaaingEndring,
} from "./utkastEndringerTypes";
import {
  findKrets,
  getKretserMedGrensejusteringer,
  groupEndringerByKommune,
  OperasjonerOrNull,
} from "./endringerUtils";
import { getNavnInSpraak } from "utils/language/language";

export const getStemmekretserMedEndringer = (
  operasjoner: OperasjonerOrNull
): string[] => {
  const endringerResponse =
    operasjoner?.metadataendringer?.stemmekretsendringer;

  if (endringerResponse == null || operasjoner == null) {
    return [];
  }

  const stemmekretserMedMetadataEndringer = removeNull(
    Object.keys(operasjoner?.metadataendringer?.stemmekretsendringer)
  );

  const viderefoertStemmekrets =
    operasjoner?.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets
      ?.lokalId;

  const gamleKretser =
    operasjoner?.stemmekretsSammenslaaingsendring?.stemmekretserTilSammenslaaing.map(
      (krets) => krets.lokalId
    ) ?? [];

  const stemmekretserMedSammenslaaing = removeNull(
    gamleKretser.concat(viderefoertStemmekrets ?? [])
  );

  const alleStemmekretserMedEndringer = getKretserMedGrensejusteringer(
    operasjoner,
    "STEMMEKRETS"
  )
    .concat(stemmekretserMedMetadataEndringer)
    .concat(stemmekretserMedSammenslaaing);

  return deduplicate(alleStemmekretserMedEndringer);
};

const getEndringAvTypeForId = (
  type: StemmekretsMetadataEndringstype,
  stemmekrets: string,
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[]
): Endring | null => {
  const gammelStemmekrets = findKrets(stemmekrets, alleStemmekretser);
  const nyVerdi =
    operasjoner.metadataendringer.stemmekretsendringer?.[stemmekrets]?.[
      type
    ]?.trim();

  const gammelVerdi = gammelStemmekrets[type]?.trim() ?? "";

  if (gammelVerdi === nyVerdi || nyVerdi == null) {
    return null;
  }

  return {
    fra: gammelVerdi,
    til: nyVerdi,
  };
};

const harMetadataEndring = (
  metadatEndring: StemmekretsMetadataEndring
): boolean => {
  const fieldsToCheck = [
    metadatEndring.stemmekretsnavn,
    metadatEndring.stemmekretsnummer,
    metadatEndring.tellekretsnavn,
    metadatEndring.tellekretsnummer,
    metadatEndring.valgdistriktsnummer,
  ];

  return fieldsToCheck.some((field) => field != null);
};

const getMetadataEndringer = (
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[]
): StemmekretsMetadataEndring[] => {
  return stemmekretser
    .map((stemmekretsId) => {
      const getEndringAvType = (type: StemmekretsMetadataEndringstype) =>
        getEndringAvTypeForId(
          type,
          stemmekretsId,
          operasjoner,
          alleStemmekretser
        );

      return {
        kretsEndret: findKrets(stemmekretsId, alleStemmekretser),
        stemmekretsnavn: getEndringAvType("stemmekretsnavn"),
        stemmekretsnummer: getEndringAvType("stemmekretsnummer"),
        tellekretsnavn: getEndringAvType("tellekretsnavn"),
        tellekretsnummer: getEndringAvType("tellekretsnummer"),
        valgdistriktsnummer: getEndringAvType("valgdistriktsnummer"),
      };
    })
    .filter(harMetadataEndring);
};

const getSammenslaaingEndring = (
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[]
): StemmekretsSammenslaaingEndring | null => {
  const viderefoertKrets =
    operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets;
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

  const krets = findKrets(viderefoertKrets.lokalId, alleStemmekretser);

  const gamleKretser = sammenslaaing?.stemmekretserTilSammenslaaing
    .map((gammelKrets) => findKrets(gammelKrets.lokalId, alleStemmekretser))
    .map((gammelKrets) => ({
      navn: gammelKrets.stemmekretsnavn,
      nummer: gammelKrets.stemmekretsnummer,
    }));

  return {
    viderefoertKrets: krets,
    nyttNavn: sammenslaaing?.stemmekretsNavn ?? "",
    nyttNummer: sammenslaaing?.stemmekretsNummer ?? "",
    gamleKretser,
  };
};

const getEndringerForKommune = (
  kommuneId: string,
  stemmekretserMedEndring: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
  alleKommuner: KommuneRef[]
): Stemmekretsendringer => {
  const stemmekretserMedGrensejusteringer = getKretserMedGrensejusteringer(
    operasjoner,
    "STEMMEKRETS"
  );

  const kommune = alleKommuner.find(
    (kommuneRef) => kommuneRef.kommunenummer.id === kommuneId
  );

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      nummer: kommune?.kommunenummer.kodeverdi ?? "",
      navn: getNavnInSpraak(kommune?.navn, "nor"),
    },
    metadataendringer: getMetadataEndringer(
      stemmekretserMedEndring,
      operasjoner,
      alleStemmekretser
    ),
    grensejusteringer: removeNull(
      stemmekretserMedEndring
        .filter((id) => stemmekretserMedGrensejusteringer.includes(id))
        .map((stemmekretsId) => findKrets(stemmekretsId, alleStemmekretser))
    ),
    sammenslaaing: getSammenslaaingEndring(
      stemmekretserMedEndring,
      operasjoner,
      alleStemmekretser
    ),
  };
};

export const getStemmekretsEndringer = (
  endredeStemmekretser: string[],
  operasjoner: OperasjonerOrNull,
  alleStemmekretser: StemmekretsResponse[],
  alleKommuner: KommuneRef[]
): Stemmekretsendringer[] | null => {
  if (operasjoner == null || endredeStemmekretser.length == 0) {
    return null;
  }

  const endredeStemmekretserGroupedBykommuneId = groupEndringerByKommune(
    endredeStemmekretser,
    alleStemmekretser
  );

  return Object.entries(endredeStemmekretserGroupedBykommuneId).map(
    ([kommune, stemmekretser]) =>
      getEndringerForKommune(
        kommune,
        stemmekretser,
        operasjoner,
        alleStemmekretser,
        alleKommuner
      )
  );
};
