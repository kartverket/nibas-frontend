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

export type TilhorighetChoice = {
  [Tilhorighet.A]: string | undefined;
  [Tilhorighet.B]: string | undefined;
};

export type TilhorighetForm = {
  [KontekstType.GRUNNKRETS]: TilhorighetChoice;
  [KontekstType.STEMMEKRETS]: TilhorighetChoice;
};

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

// Tar lokalider og mapper de til kretsValgene hvis det finnes en krets i kretsValg med tilsvarende id
export const getUpdatedKontekstEgenskaper = (
  newKretsIds: TilhorighetChoice,
  kretsValg: TilhorighetOptions,
): KontekstEgenskaper[] => {
  const kretser = Object.values(newKretsIds).map(
    (id) => kretsValg.a.concat(kretsValg.b).find((krets) => krets.id.lokalid.value === id)!,
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
  if (formState.a !== undefined && formState.b !== undefined && tilhorighetOptions) {
    const kretsA = tilhorighetOptions[Tilhorighet.A].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.A],
    );
    const kretsB = tilhorighetOptions[Tilhorighet.B].find(
      (krets) => krets.id.lokalid.value === formState[Tilhorighet.B],
    );
    if (kretsA && kretsB) {
      return `${kretsA.nummer} ${kretsA.navn}, ${kretsB.nummer} ${kretsB.navn}`;
    }
  }
};

export const getKommunerIdFromKontekstEgenskaper = (kontekstEgenskaper: KontekstEgenskaper[]): string[] => {
  return kontekstEgenskaper
    .filter((kontekst) => kontekst.kommuneId !== null)
    .map((kontekst) => kontekst.kommuneId!.lokalid.value);
};

export const mapGrunnkretsRefToKrets = (grunnkretser: GrunnkretsRef[]): Krets[] => {
  return grunnkretser.map(({ id, version, grunnkretsnummer, navn, kommuneIdentifikator }) => ({
    id,
    kommuneId: kommuneIdentifikator,
    version,
    nummer: grunnkretsnummer,
    navn: navn,
    type: KontekstType.GRUNNKRETS,
  }));
};

export const mapStemmekretRefToKrets = (stemmekretser: StemmekretsRef[]): Krets[] => {
  return stemmekretser.map(({ id, version, nummer, navn, kommuneIdentifikator }) => ({
    id,
    kommuneId: kommuneIdentifikator,
    version,
    nummer: nummer,
    navn: navn,
    type: KontekstType.STEMMEKRETS,
  }));
};
