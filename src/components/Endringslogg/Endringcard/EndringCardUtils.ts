import { AllEndringTypes, Change, NumericEndringType } from "components/Endringslogg/Endringcard/EndringCardTypes";
import { Metadataendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";
import { removeNil } from "utils/list-utils";

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
    case "valgdistrikt":
      return "Endring av valgdistrikt";
  }
};

export const getBodyTextForNumericChange = (value: number, endringstype: NumericEndringType): string => {
  switch (endringstype) {
    case "grenseendring":
      return `${value} ${value > 1 ? "grenseendringer" : "grenseendring"} er gjennomført `;
    case "arkiveringer":
      return `${value} eksisterende ${value > 1 ? "grenser" : "grense"} er arkivert`;
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

export const getValgdistriktChanges = (metadataendringer: Metadataendringer[]): Change[] => {
  const valgdistriksendringer = removeNil(
    metadataendringer.map((endring) => (endring.kretsType === "STEMMEKRETS" ? endring.valgdistriktsnummer : null)),
  );

  return removeNil(
    valgdistriksendringer.map((endring) => {
      if (endring?.fra == null || endring?.til == null || endring?.fra === endring?.til) {
        return null;
      }
      return {
        from: [endring?.fra?.toString() ?? "[Ingen verdi]"],
        to: [endring?.til?.toString() ?? "[Ingen verdi]"],
      };
    }),
  );
};
