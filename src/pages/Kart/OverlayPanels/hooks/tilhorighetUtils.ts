import { UseFormRegister, UseFormGetValues } from "react-hook-form";
import { GrunnkretsRef, KontekstEgenskaper, ObjektIdentifikator, StemmekretsRef } from "types/api";

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

// tar to kontekstEgenskaper og mapper de til TilhorighetForm
export const getTilhorighetData = (tilhorigheter: KontekstEgenskaper[] | undefined): TilhorighetForm | undefined => {
  if (tilhorigheter && tilhorigheter.length == 2) {
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
    navn: "",
    nummer: "",
    type: kontekstType,
  };
};

// Tar lokalider og mapper de til kretsValgene hvis det finnes en krets i kretsValg med tilsvarende id
export const getUpdatedKontekstEgenskaper = (
  kontekstType: KontekstType,
  newKretsIds: TilhorighetChoice,
  kretsValg: TilhorighetOptions,
): KontekstEgenskaper[] => {
  const allPossibleOptions = kretsValg.a.concat(kretsValg.b);
  const kretser = Object.values(newKretsIds).map(
    (id) => allPossibleOptions.find((krets) => krets.id.lokalid.value === id) ?? getDefaultKrets(kontekstType),
  );
  const nyeKontekstEgenskaper = kretser.map((krets) => ({
    id: krets.id,
    kommuneId: krets.kommuneId,
    type: krets.type,
    version: krets.version,
    retningMedKlokken: true,
    rekkefoelge: 0,
    flateIndeks: 0,
    hullIndeks: 0,
  }));
  return nyeKontekstEgenskaper;
};

export const getTilhorighetValuesFormatted = (
  formState: TilhorighetChoice,
  tilhorighetOptions: TilhorighetOptions | undefined,
) => {
  if (formState && formState.a != undefined && formState.b != undefined && tilhorighetOptions) {
    const kretsA = tilhorighetOptions[Tilhorighet.A].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.A],
    );
    const kretsB = tilhorighetOptions[Tilhorighet.B].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.B],
    );
    if (!kretsA && !kretsB) {
      return undefined;
    } else
      return (kretsA ? `${kretsA.nummer} ${kretsA.navn}` : "Ikke valgt").concat(
        ", " + (kretsB ? `${kretsB.nummer} ${kretsB.navn}` : "Ikke valgt"),
      );
  }
};

export const getKommunerIdFromKontekstEgenskaper = (kontekstEgenskaper: KontekstEgenskaper[]): string[] | null => {
  const kommuner = kontekstEgenskaper
    .filter((kontekst) => kontekst.kommuneId != null)
    .map((kontekst) => kontekst.kommuneId!.lokalid.value);
  return kommuner.length > 0 ? kommuner : null;
};

export const sortKretserOptionsByName = (kretser: Krets[] | undefined): Krets[] => {
  if (!kretser) return [];

  return kretser.sort((a, b) => a.navn.localeCompare(b.navn));
};

export const sortKretserOptionsByNumber = (kretser: Krets[] | undefined): Krets[] => {
  if (!kretser) return [];

  return kretser.sort((a, b) => Number(a.nummer) - Number(b.nummer));
};

export const mapGrunnkretsRefToKrets = (grunnkretser: GrunnkretsRef[]): Krets[] => {
  return sortKretserOptionsByNumber(
    grunnkretser.map(({ id, version, grunnkretsnummer, navn, kommuneIdentifikator }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      version,
      nummer: grunnkretsnummer,
      navn: navn,
      type: KontekstType.GRUNNKRETS,
    })),
  );
};

export const mapStemmekretRefToKrets = (stemmekretser: StemmekretsRef[]): Krets[] => {
  return sortKretserOptionsByNumber(
    stemmekretser.map(({ id, version, nummer, navn, kommuneIdentifikator }) => ({
      id,
      kommuneId: kommuneIdentifikator,
      version,
      nummer: nummer,
      navn: navn,
      type: KontekstType.STEMMEKRETS,
    })),
  );
};
