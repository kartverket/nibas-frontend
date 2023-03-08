import {
  KommuneRef,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import { deduplicate, removeNull } from "utils/list-utils";
import {
  StemmekretsEndringstype,
  StemmekretsEndring,
  Stemmekretsendringer,
} from "./utkastEndringerTypes";
import {
  findKrets,
  getKretserMedGrensejusteringer,
  groupEndringerByKommune,
  OperasjonerOrNull,
} from "./endringerUtils";

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

  const alleStemmekretserMedEndringer = getKretserMedGrensejusteringer(
    operasjoner
  ).concat(stemmekretserMedMetadataEndringer);

  return deduplicate(alleStemmekretserMedEndringer);
};

const getEndringerAvType = (
  type: StemmekretsEndringstype,
  stemmekretser: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[]
): StemmekretsEndring[] => {
  const stemmekretsendringer =
    operasjoner.metadataendringer.stemmekretsendringer;
  const stemmekretserMedEndringAvGittType = stemmekretser.filter(
    (id) => stemmekretsendringer?.[id]?.[type] != null
  );
  return stemmekretserMedEndringAvGittType
    .map((id) => {
      const gammelStemmekrets = findKrets(id, alleStemmekretser);
      return {
        kretsEndret: gammelStemmekrets,
        fra: gammelStemmekrets[type]?.trim() ?? "",
        til: stemmekretsendringer?.[id]?.[type]?.trim() ?? "",
      };
    })
    .filter((endring) => endring.fra !== endring.til);
};

const getEndringerForKommune = (
  kommuneId: string,
  stemmekretserMedEndring: string[],
  operasjoner: UtkastOperasjoner,
  alleStemmekretser: StemmekretsResponse[],
  alleKommuner: KommuneRef[]
): Stemmekretsendringer => {
  const stemmekretserMedGrensejusteringer =
    getKretserMedGrensejusteringer(operasjoner);

  const getEndringer = (type: StemmekretsEndringstype) =>
    getEndringerAvType(
      type,
      stemmekretserMedEndring,
      operasjoner,
      alleStemmekretser
    );

  const kommune = alleKommuner.find(
    (kommuneRef) => kommuneRef.kommunenummer.id === kommuneId
  );

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      navn: kommune?.navn[0].navn ?? "",
    },
    stemmekretsnavn: getEndringer("stemmekretsnavn"),
    stemmekretsnummer: getEndringer("stemmekretsnummer"),
    tellekretsnummer: getEndringer("tellekretsnummer"),
    tellekretsnavn: getEndringer("tellekretsnavn"),
    valgdistriktsnummer: getEndringer("valgdistriktsnummer"),
    grensejusteringer: removeNull(
      stemmekretserMedEndring
        .filter((id) => stemmekretserMedGrensejusteringer.includes(id))
        .map((stemmekretsId) => findKrets(stemmekretsId, alleStemmekretser))
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
