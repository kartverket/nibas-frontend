import type { GrenseRef, Spraak } from "types/api";

export const getNavnInSpraak = (
  spraak: Spraak[] | string,
  language: string
) => {
  if (typeof spraak === "string") {
    // hvis det bare er en string har det samme navn i alle språk
    return spraak;
  }

  return (
    spraak.find((navn) => navn.spraak === language)?.navn ??
    "Ingen oversettelse"
  );
};

export const sortGrenserAlphabetically = <T extends GrenseRef>(grenser?: T[]) =>
  grenser?.sort((a, b) =>
    getNavnInSpraak(a.navn, "nor").localeCompare(
      getNavnInSpraak(b.navn, "nor"),
      "nb"
    )
  );
