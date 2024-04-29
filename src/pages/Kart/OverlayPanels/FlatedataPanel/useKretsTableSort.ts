import { Inndelingtype } from "contexts/InndelingerContext/InndelingerContext";
import { useState } from "react";
import { GrunnkretsResponse, KommuneResponse, StemmekretsResponse } from "types/api";
import get from "lodash.get";

type InndelingResponse = KommuneResponse | StemmekretsResponse | GrunnkretsResponse;
type ResponseProperty = keyof KommuneResponse | keyof StemmekretsResponse | keyof GrunnkretsResponse;
interface PropertiesByInndelingtype extends Record<Inndelingtype, ResponseProperty[]> {
  fylke: (keyof KommuneResponse)[];
  kommune: (keyof KommuneResponse)[];
  stemmekrets: (keyof StemmekretsResponse)[];
  grunnkrets: (keyof GrunnkretsResponse)[];
}

const propertiesByInndelingtype: PropertiesByInndelingtype = {
  fylke: ["nummer", "navn", "samiskforvaltningsomraade"],
  kommune: ["nummer", "navn", "samiskforvaltningsomraade"],
  stemmekrets: ["nummer", "navn", "valgdistriktsnummer"],
  grunnkrets: ["nummer", "navn"],
};

export const useKretsTableSort = (inndelingtype: Inndelingtype) => {
  const properties = propertiesByInndelingtype[inndelingtype];
  const [sortProperty, setSortProperty] = useState(properties[0]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const onSort = (property: ResponseProperty) => {
    if (property === sortProperty) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        // Hvis man har trykket på en knapp tre ganger går vi tilbake til start
        setSortProperty(properties[0]);
        setSortOrder("asc");
      }
    } else {
      setSortProperty(property);
      setSortOrder("asc");
    }
  };

  const sortHeaderProps = (property: ResponseProperty) => ({
    onClick: () => onSort(property),
    isActivated: sortProperty === property,
    isReversed: sortProperty === property && sortOrder === "desc",
  });

  return { sortProperty, sortOrder, sortHeaderProps };
};

export function orderInndelingerBy(
  items: InndelingResponse[],
  sortField: ResponseProperty,
  sortOrder: "asc" | "desc",
): InndelingResponse[] {
  const sortedItems = items.sort((itemA, itemB) => {
    const itemAValue = get(itemA, sortField, "");
    const itemBValue = get(itemB, sortField, "");

    // TODO: må håndtere Spraak
    // TODO: må håndtere... alt annet, dette sorterer jo bare på string? eller?

    if (isString(itemAValue) && isString(itemBValue)) {
      return itemAValue.toLowerCase().localeCompare(itemBValue.toLowerCase(), "no");
    }
    if (isString(itemAValue)) {
      return 1;
    }
    if (isString(itemBValue)) {
      return -1;
    }
    return 0;
  });

  return sortOrder === "asc" ? sortedItems : sortedItems.reverse();
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
