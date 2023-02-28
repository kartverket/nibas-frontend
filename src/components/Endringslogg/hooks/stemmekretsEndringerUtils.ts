import {
  KommuneRef,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";
import { components } from "../../../types/api-gen";
import { addToList, deduplicate, removeNull } from "utils/list-utils";
import {
  Endringstype,
  StemmekretsEndring,
  Stemmekretsendringer,
} from "./utkastEndringerTypes";

type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export const getStemmekretserMedGrensejusteringer = (
  operasjoner: OperasjonerOrNull
): string[] => {
  const endredeFeaturesMap = operasjoner?.grenseendringer?.endredeFeatures;

  if (endredeFeaturesMap == null || operasjoner == null) {
    return [];
  }

  const endredeFeatures = removeNull(
    Object.values(endredeFeaturesMap)
  ) as components["schemas"]["Feature"][];

  return removeNull(
    endredeFeatures.map(
      (feature) => feature.properties.kontekstEgenskaper?.id?.lokalid?.value
    )
  );
};

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

  const alleStemmekretserMedEndringer = getStemmekretserMedGrensejusteringer(
    operasjoner
  ).concat(stemmekretserMedMetadataEndringer);

  return deduplicate(alleStemmekretserMedEndringer);
};

/**
 * Denne funksjonen tar inn et sett med endrede stemmekretser og lager et map av endringene hvor de er gruppert per kommune.
 * Resultatet er da er Map med KommuneId som key og en liste an endrede stemmekretser som value.
 */
const groupEndringerByKommune = (
  endredeStemmekretser: string[],
  alleStemmekretser: StemmekretsResponse[]
): { [kommuneid: string]: string[] } => {
  return endredeStemmekretser
    .map((stemmekretsid) => {
      const stemmekrets = alleStemmekretser.find(
        (s) => s.id.lokalid.value === stemmekretsid
      );
      return [stemmekretsid, stemmekrets?.kommunenummer.id];
    })
    .reduce((acc: { [key: string]: string[] }, [stemmekretsid, kommune]) => {
      if (kommune == null) {
        return acc;
      }
      return { ...acc, [kommune]: addToList(stemmekretsid, acc[kommune]) };
    }, {});
};

const findStemmekrets = (
  id: string,
  stemmekretser: StemmekretsResponse[]
): StemmekretsResponse => {
  const resultat = stemmekretser.find(
    (stemmekrets) => stemmekrets.id.lokalid.value === id
  );
  if (resultat == null) {
    throw Error(
      `Kunne ikke finne stemmekrets med id: ${id}. Dette skal egentlig ikke skje, og kan tyde på feil i implementasjonen. Gjerne ta kontakt med Team Smia om feilen vedvarer.`
    );
  }
  return resultat;
};

const getEndringerAvType = (
  type: Endringstype,
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
      const gammelStemmekrets = findStemmekrets(id, alleStemmekretser);
      return {
        kretsEndret: gammelStemmekrets,
        fra: gammelStemmekrets[type] ?? "",
        til: stemmekretsendringer?.[id]?.[type] ?? "",
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
    getStemmekretserMedGrensejusteringer(operasjoner);

  const getEndringer = (type: Endringstype) =>
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
        .map((stemmekretsId) =>
          findStemmekrets(stemmekretsId, alleStemmekretser)
        )
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
