import { InndelingNavn } from "types/api";

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
