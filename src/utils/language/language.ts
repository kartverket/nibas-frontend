import type { Spraak } from "types/api";

export const getNavnInSpraak = (spraak: Spraak[], language: string) => {
  return (
    spraak.find((navn) => navn.spraak === language)?.navn ??
    "Ingen oversettelse"
  );
};
