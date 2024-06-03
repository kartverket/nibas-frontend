import { AllEndringTypes, Change, NumericEndringType } from "components/Endringslogg/Endringcard/EndringCardTypes";
import { Metadataendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";

export const getTitleForEndringstype = (endringstype: AllEndringTypes): string => {
  switch (endringstype) {
    case "arkiveringer":
      return "Arkiverte grenser";
    case "deling":
      return "Delinger av kretser";
    case "flatedetaljer":
      return "Endring av flatedetaljer";
    case "grenseendring":
      return "Endringer på grenser";
    case "grenseinformasjon":
      return "Endring av grenseinformasjon";
    case "nyegrenser":
      return "Nye grenser";
    case "sammenslåing":
      return "Sammenslåing";
  }
};

export const getBodyTextForNumericChange = (value: number, endringstype: NumericEndringType): string => {
  switch (endringstype) {
    case "grenseendring": {
      const grenseendring = value > 1 ? "grenseendringer" : "grenseendring";
      const metadataendring = value > 1 ? "metadataendringer" : "metadataendring";
      return `${value} ${grenseendring} eller ${metadataendring} har blitt gjennomført `;
    }
    case "arkiveringer":
      return `${value} eksisterende ${value > 1 ? "grenser" : "grense"} har blitt arkivert`;
    case "grenseinformasjon":
      return `${value} eksisterende ${value > 1 ? "grenser" : "grense"} har fått endret informasjon`;
    case "nyegrenser":
      return `${value} ${value > 1 ? "nye grenser" : "ny grense"} er tegnet`;
  }
};

export const getNavnOgNummerChanges = (metadataendringer: Metadataendringer[]): Change[] => {
  return metadataendringer
    .map((endring) => {
      const nummerTil = endring.nummer ?? endring.opprinneligKrets.nummer;
      const navnTil = endring.navn ?? endring.opprinneligKrets.navn;

      return {
        from: [`${endring.opprinneligKrets.nummer} ${endring.opprinneligKrets.navn}`],
        to: [`${nummerTil} ${navnTil}`],
      };
    })
    .filter((change) => change.from !== change.to);
};
