import {
  GrunnkretsResponse,
  KommuneRef,
  UtkastOperasjoner,
} from "../../../types/api";
import { deduplicate, removeNull } from "utils/list-utils";
import {
  GrunnkretsEndringstype,
  GrunnkretsEndring,
  Grunnkretsendringer,
} from "./utkastEndringerTypes";
import {
  findKrets,
  getKretserMedGrensejusteringer,
  groupEndringerByKommune,
  OperasjonerOrNull,
} from "./endringerUtils";

export const getGrunnkretserMedEndringer = (
  operasjoner: OperasjonerOrNull
): string[] => {
  const endringerResponse = operasjoner?.metadataendringer?.grunnkretsendringer;

  if (endringerResponse == null || operasjoner == null) {
    return [];
  }

  const grunnkretsMetadataEndringer = removeNull(
    Object.keys(operasjoner?.metadataendringer?.grunnkretsendringer)
  );

  const alleGrunnkretserMedEndringer = getKretserMedGrensejusteringer(
    operasjoner
  ).concat(grunnkretsMetadataEndringer);

  return deduplicate(alleGrunnkretserMedEndringer);
};

const getEndringerAvType = (
  type: GrunnkretsEndringstype,
  grunnkretser: string[],
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[]
): GrunnkretsEndring[] => {
  const grunnkretsendringer = operasjoner.metadataendringer.grunnkretsendringer;
  const grunnkretserMedEndringAvGittType = grunnkretser.filter(
    (id) => grunnkretsendringer?.[id]?.[type] != null
  );
  return grunnkretserMedEndringAvGittType
    .map((id) => {
      const gammelGrunnkrets = findKrets(id, alleGrunnkretser);
      return {
        kretsEndret: gammelGrunnkrets,
        fra: gammelGrunnkrets[type],
        til: grunnkretsendringer?.[id]?.[type],
      };
    })
    .filter((endring) => endring.fra !== endring.til);
};

const getEndringerForKommune = (
  kommuneId: string,
  grunnkretserMedEndringer: string[],
  operasjoner: UtkastOperasjoner,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneRef[]
): Grunnkretsendringer => {
  const grunnkretserMedGrensejusteringer =
    getKretserMedGrensejusteringer(operasjoner);

  const getEndringer = (type: GrunnkretsEndringstype) =>
    getEndringerAvType(
      type,
      grunnkretserMedEndringer,
      operasjoner,
      alleGrunnkretser
    );

  const kommune = alleKommuner.find(
    (kommuneRef) => kommuneRef.kommunenummer.id === kommuneId
  );

  return {
    kommune: {
      id: kommune?.id.lokalid.value ?? "",
      navn: kommune?.navn[0].navn ?? "",
    },
    navn: getEndringer("navn"),
    grunnkretsnummer: getEndringer("grunnkretsnummer"),
    grensejusteringer: removeNull(
      grunnkretserMedEndringer
        .filter((id) => grunnkretserMedGrensejusteringer.includes(id))
        .map((grunnkretsId) => findKrets(grunnkretsId, alleGrunnkretser))
    ),
  };
};

export const getGrunnkretsEndringer = (
  endredeGrunnkretser: string[],
  operasjoner: OperasjonerOrNull,
  alleGrunnkretser: GrunnkretsResponse[],
  alleKommuner: KommuneRef[]
): Grunnkretsendringer[] | null => {
  if (operasjoner == null || endredeGrunnkretser.length == 0) {
    return null;
  }

  const endredeGrunnkretserGroupedBykommuneId = groupEndringerByKommune(
    endredeGrunnkretser,
    alleGrunnkretser
  );

  return Object.entries(endredeGrunnkretserGroupedBykommuneId).map(
    ([kommune, stemmekretser]) =>
      getEndringerForKommune(
        kommune,
        stemmekretser,
        operasjoner,
        alleGrunnkretser,
        alleKommuner
      )
  );
};
