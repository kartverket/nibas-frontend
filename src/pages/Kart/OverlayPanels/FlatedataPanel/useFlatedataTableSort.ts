import get from "lodash.get";
import { useState } from "react";
import {
  BopliktomraadeResponse,
  FylkeResponse,
  GrunnkretsResponse,
  KommuneResponse,
  MetadataResponse,
  StemmekretsResponse,
} from "types/api";
import { FlatedataTableInndelingtype } from "./FlatedataPanel";

type ResponseProperty =
  | keyof FylkeResponse
  | keyof KommuneResponse
  | keyof StemmekretsResponse
  | keyof GrunnkretsResponse
  | keyof BopliktomraadeResponse;

const sortablePropertiesByInndelingtype = {
  FYLKE: ["nummer", "navn", "samiskforvaltningsomraade"] as const,
  KOMMUNE: ["nummer", "navn", "samiskforvaltningsomraade"] as const,
  STEMMEKRETS: ["nummer", "navn", "valgdistriktsnummer", "tellekretsnavn", "tellekretsnummer"] as const,
  GRUNNKRETS: ["nummer", "navn"] as const,
  BOPLIKTOMRAADE: ["nummer", "navn", "gjelderKunDelAvKommunen", "harUsikkerAvgrensning"] as const,
} satisfies Record<FlatedataTableInndelingtype, ResponseProperty[]>;

export const useFlatedataTableSort = (inndelingtype: FlatedataTableInndelingtype) => {
  const sortProperties = sortablePropertiesByInndelingtype[inndelingtype];
  type SortProperty = (typeof sortProperties)[number];
  const [sortProperty, setSortProperty] = useState<SortProperty>(sortProperties[0]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const onSort = (property: SortProperty) => {
    if (property === sortProperty) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        // Hvis man har trykket på en knapp tre ganger går vi tilbake til start
        setSortProperty(sortProperties[0]);
        setSortOrder("asc");
      }
    } else {
      setSortProperty(property);
      setSortOrder("asc");
    }
  };

  const sortHeaderProps = (property: SortProperty) => ({
    onClick: () => onSort(property),
    isActivated: sortProperty === property,
    isReversed: sortProperty === property && sortOrder === "desc",
  });

  return { sortProperty, sortOrder, sortHeaderProps };
};

export function orderInndelingerBy(
  items: MetadataResponse[],
  sortField: ResponseProperty,
  sortOrder: "asc" | "desc",
): MetadataResponse[] {
  const sortedItems = items.sort((itemA, itemB) => {
    const itemAValue = get(itemA, sortField, "");
    const itemBValue = get(itemB, sortField, "");

    // Hvis begge verdiene er strenger, men kun inneholder siffer, behandle de som siffer
    const isNumericA = typeof itemAValue === "string" && /^\d+$/.test(itemAValue);
    const isNumericB = typeof itemBValue === "string" && /^\d+$/.test(itemBValue);

    if (isNumericA && isNumericB) {
      return Number(itemAValue) - Number(itemBValue);
    }

    if (typeof itemAValue === "string" && typeof itemBValue === "string") {
      return itemAValue.toLowerCase().localeCompare(itemBValue.toLowerCase(), "no");
    }

    if (typeof itemAValue === "boolean" && typeof itemBValue === "boolean") {
      return itemAValue === itemBValue ? 0 : itemAValue ? 1 : -1;
    }

    if (typeof itemAValue === "number" && typeof itemBValue === "number") {
      return itemAValue - itemBValue;
    }

    // Spesifikt vinklet mot å kunne sortere på navn for administrative enheter (Spraak[])
    // Som en forenkling sorterer vi på det første navnet i listen
    if (Array.isArray(itemAValue) && Array.isArray(itemBValue)) {
      if ("navn" in itemAValue[0] && "navn" in itemBValue[0]) {
        return itemAValue[0].navn.toLowerCase().localeCompare(itemBValue[0].navn.toLowerCase(), "no");
      }
    }

    return 0;
  });

  return sortOrder === "asc" ? sortedItems : sortedItems.reverse();
}
