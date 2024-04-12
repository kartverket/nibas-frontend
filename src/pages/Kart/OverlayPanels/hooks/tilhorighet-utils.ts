import { UseFormRegister, UseFormGetValues } from "react-hook-form";
import { GrunnkretsResponse, KontekstEgenskaper, ObjektIdentifikator, StemmekretsResponse } from "types/api";

export enum Tilhorighet {
  A = "a",
  B = "b",
}

export enum KontekstType {
  GRUNNKRETS = "GRUNNKRETS",
  STEMMEKRETS = "STEMMEKRETS",
}

export type Krets = {
  id: ObjektIdentifikator;
  kommuneId: ObjektIdentifikator;
  kommunenummer: string;
  version: number;
  nummer: string;
  navn: string;
  type: KontekstType;
};

export type TilhorighetOptions = {
  [Tilhorighet.A]: Krets[];
  [Tilhorighet.B]: Krets[];
};

export enum CustomOption {
  NOT_CHOSEN = "NOT_CHOSEN",
}

export type TilhorighetChoice = {
  [Tilhorighet.A]: string | undefined;
  [Tilhorighet.B]: string | undefined;
};

export type TilhorighetForm = {
  [KontekstType.GRUNNKRETS]: TilhorighetChoice;
  [KontekstType.STEMMEKRETS]: TilhorighetChoice;
};

export interface UseTilhorighet {
  kontekstType: KontekstType;
  tilhorighetOptions: TilhorighetOptions | undefined;
  isDirty: boolean;
  register: UseFormRegister<TilhorighetForm>;
  resetTilhorighet: () => void;
  updateDraftFromFeature: () => void;
  getValues: UseFormGetValues<TilhorighetForm>;
  isLoading: boolean;
}

const getDefaultTilhorighetData = () => ({
  GRUNNKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
  STEMMEKRETS: { a: CustomOption.NOT_CHOSEN, b: CustomOption.NOT_CHOSEN },
});

// tar to kontekstEgenskaper og mapper de til TilhorighetForm
export const getTilhorighetData = (tilhorigheter: KontekstEgenskaper[] | undefined): TilhorighetForm => {
  if (tilhorigheter && tilhorigheter.length > 0) {
    const grunnkretser = tilhorigheter
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === KontekstType.GRUNNKRETS)
      .map((grunnkrets) => grunnkrets.id?.lokalid.value);
    const stemmekretser = tilhorigheter
      .filter((kontekstEgenskaper) => kontekstEgenskaper.type === KontekstType.STEMMEKRETS)
      .map((stemmekrets) => stemmekrets.id?.lokalid.value);
    if (grunnkretser.length === 2 || stemmekretser.length === 2) {
      return {
        [KontekstType.GRUNNKRETS]: {
          [Tilhorighet.A]: grunnkretser[0],
          [Tilhorighet.B]: grunnkretser[1],
        },
        [KontekstType.STEMMEKRETS]: {
          [Tilhorighet.A]: stemmekretser[0],
          [Tilhorighet.B]: stemmekretser[1],
        },
      };
    }
  }
  return getDefaultTilhorighetData();
};

// Gir en krets med lokalid lik Default option slik at default verdien kan sendes som data slik som vanlige kretser.
const getDefaultKrets = (kontekstType: KontekstType): Krets => {
  const defaultIdentifikator: ObjektIdentifikator = {
    lokalid: {
      value: CustomOption.NOT_CHOSEN,
    },
    gyldighetsdato: "",
  };
  return {
    id: defaultIdentifikator,
    kommuneId: defaultIdentifikator,
    version: 0,
    kommunenummer: "",
    navn: "",
    nummer: "",
    type: kontekstType,
  };
};

// Tar lokalider og mapper de til kretsValgene hvis det finnes en krets i kretsValg med tilsvarende id
export const getUpdatedKontekstEgenskaper = (
  kontekstType: KontekstType,
  newKretsIds: TilhorighetChoice,
  kretsOptions: TilhorighetOptions,
  existingKontekstEgenskaper: KontekstEgenskaper[],
): KontekstEgenskaper[] => {
  const allPossibleOptions = kretsOptions.a.concat(kretsOptions.b);
  const kretser = Object.values(newKretsIds).map(
    (id) => allPossibleOptions.find((krets) => krets.id.lokalid.value === id) ?? getDefaultKrets(kontekstType),
  );
  const kontekstEgenskaperToKeep = existingKontekstEgenskaper.filter((k) => kontekstType.valueOf() !== k.type);
  const nyeKontekstEgenskaper = kretser.map((krets) => ({
    id: krets.id.lokalid.value.startsWith("NY_KRETS") ? undefined : krets.id, // fjerner tempid når vi setter kontekstEgenskapene på featuren
    kommuneId: krets.kommuneId,
    kretsNummer: krets.nummer,
    type: krets.type,
    version: krets.version,
  }));
  return kontekstEgenskaperToKeep.concat(nyeKontekstEgenskaper);
};

export const formatKretsNavn = (krets: Krets | null | undefined): string => {
  if (krets == null) {
    return "Ikke valgt";
  }
  if (krets.type === KontekstType.STEMMEKRETS) {
    return `(${krets.kommunenummer}) ${krets.nummer} ${krets.navn}`;
  }
  return `${krets.nummer} ${krets.navn}`;
};

export const getKommunerIdFromKontekstEgenskaper = (
  kontekstEgenskaper: KontekstEgenskaper[],
  kontekstType: KontekstType,
): string[] | null => {
  const kommuner = kontekstEgenskaper
    .filter((kontekst) => kontekst.type === kontekstType)
    .filter((kontekst) => kontekst.kommuneId !== null)
    .map((kontekst) => kontekst.kommuneId!.lokalid.value);
  return kommuner.length > 0 ? kommuner : null;
};

export const sortKretserOptionsByFormattedName = (kretser: Krets[] | undefined): Krets[] => {
  if (!kretser) return [];

  return kretser.sort((a, b) => formatKretsNavn(a).localeCompare(formatKretsNavn(b)));
};

export const mapGrunnkretsResponseToKrets = (grunnkretser: GrunnkretsResponse[]): Krets[] => {
  return sortKretserOptionsByFormattedName(
    grunnkretser.map(({ id, version, nummer, navn, kommuneIdentifikator, kommunenummer }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      kommunenummer: kommunenummer.kodeverdi,
      version,
      nummer,
      navn,
      type: KontekstType.GRUNNKRETS,
    })),
  );
};

export const mapStemmekretResponseToKrets = (stemmekretser: StemmekretsResponse[]): Krets[] => {
  return sortKretserOptionsByFormattedName(
    stemmekretser.map(({ id, version, nummer, navn, kommuneIdentifikator, kommunenummer }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      kommunenummer: kommunenummer.kodeverdi,
      version,
      nummer,
      navn,
      type: KontekstType.STEMMEKRETS,
    })),
  );
};
