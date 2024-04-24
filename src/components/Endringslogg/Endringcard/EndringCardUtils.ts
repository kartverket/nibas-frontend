import { AllEndringTypes, Change, NumericEndringType } from "components/Endringslogg/Endringcard/EndringCardTypes";
import { KretsType, Metadataendringer } from "components/Endringslogg/hooks/utkastEndringerTypes";

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
      return `${value} ${value > 1 ? "grendeendringer" : "grenseendring"} er gjennomført`;
    case "arkiveringer":
      return `${value} eksisterende ${value > 1 ? "grenser" : "grense"} er arkivert`;
    case "nyegrenser":
      return `${value} nye ${value > 1 ? "grenser" : "grense"} er tegnet`;
  }
};

export const getNavnOgNummerChanges = <T extends KretsType>(metadataendringer: Metadataendringer<T>[]): Change[] => {
  return metadataendringer
    .map((endring) => ({
      from: [`${endring.nummer?.fra} ${endring.navn?.fra}`],
      to: [`${endring.nummer?.til} ${endring.navn?.til}`],
    }))
    .filter((change) => change.from !== change.to);
};

export const getValgdistriktChanges = (metadataendringer: Metadataendringer<"STEMMEKRETS">[]): Change[] => {
  const valgdistriktsendringer = metadataendringer.filter((endring) => {
    return endring.valgdistriktsnummer != null && endring.valgdistriktsnummer.fra !== endring.valgdistriktsnummer.til;
  });

  return valgdistriktsendringer.map((endring) => ({
    from: [endring.valgdistriktsnummer?.fra?.toString() ?? "[Ingen verdi]"],
    to: [endring.valgdistriktsnummer?.til?.toString() ?? "[Ingen verdi]"],
  }));
};
