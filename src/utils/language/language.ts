import type { Spraak } from "types/api";

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
