import { addToList, removeNil } from "utils/list-utils";
import { components } from "../../../types/api-gen";
import { GrunnkretsResponse, StemmekretsResponse, UtkastOperasjoner } from "../../../types/api";

export type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export const getKretserMedGrensejusteringer = (
  operasjoner: OperasjonerOrNull,
  type: "STEMMEKRETS" | "GRUNNKRETS",
): string[] => {
  const endredeFeaturesMap = operasjoner?.grenseendringer?.endredeFeatures;

  if (!endredeFeaturesMap) {
    return [];
  }

  const endredeFeatures = removeNil(Object.values(endredeFeaturesMap)) as components["schemas"]["Feature"][];

  return removeNil(
    endredeFeatures
      .filter((feature) => feature.properties.kontekstEgenskaper !== null)
      .flatMap((feature) => {
        const kontekstEgenskaperArray = Array.isArray(feature.properties.kontekstEgenskaper)
          ? feature.properties.kontekstEgenskaper
          : feature.properties.kontekstEgenskaper
            ? [feature.properties.kontekstEgenskaper]
            : [];

        const filteredKontekstEgenskaper = kontekstEgenskaperArray.filter(
          (kontekstEgenskaper) => kontekstEgenskaper.type === type,
        );

        return filteredKontekstEgenskaper.map((kontekstEgenskaper) => kontekstEgenskaper.id?.lokalid?.value);
      }),
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
      return [kretsId, krets?.kommunenummer.id];
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
