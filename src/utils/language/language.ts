import { InndelingNavn, Spraak } from "types/api";

export const getNavnInSpraak = (spraak: Spraak[] | string | undefined, language: string) => {
  if (typeof spraak === "string") {
    // hvis det bare er en string har det samme navn i alle språk
    return spraak;
  }

  if (!spraak) {
    return "";
  }

  return spraak.find((navn) => navn.spraak === language)?.navn ?? "Ingen oversettelse";
};

export const inndelingResponseNavnToString = (inndelingNavn: InndelingNavn): string => {
  return Array.isArray(inndelingNavn)
    ? inndelingNavn
        .sort((a, b) => {
          if (a.rekkefoelge != null && b.rekkefoelge != null) {
            return a.rekkefoelge - b.rekkefoelge;
          }

          return 0;
        })
        .map((navn) => navn.navn)
        .join(" - ")
    : inndelingNavn;
};
