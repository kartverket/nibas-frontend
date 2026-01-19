import {
  BopliktomraadeResponse,
  GrunnkretsResponse,
  KretsNavnOgNummer,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";

export type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export enum KretsType {
  GRUNNKRETS = "GRUNNKRETS",
  STEMMEKRETS = "STEMMEKRETS",
  BOPLIKTOMRAADE = "BOPLIKTOMRAADE",
}
export enum InndelingType {
  FYLKE = "FYLKE",
  KOMMUNE = "KOMMUNE",
  NASJON = "NASJON",
}

export type KontekstType = KretsType | InndelingType;

export type ResponseTypeFromKretstype<T extends KretsType> = T extends KretsType.STEMMEKRETS
  ? StemmekretsResponse
  : T extends KretsType.GRUNNKRETS
    ? GrunnkretsResponse
    : T extends KretsType.BOPLIKTOMRAADE
      ? BopliktomraadeResponse
      : never;

export type Metadataendringer = {
  kretsType: KretsType;
  opprinneligKrets: {
    navn: string;
    nummer: string;
  };
  navn: string | null | undefined;
  nummer: string | null | undefined;
};

export type KretsendringerForKommune = Kretsendringer & {
  kommune: {
    id: string;
    nummer: string;
    navn: string;
  };
};

export type KommuneendringerForFylke = {
  nummer: string;
  navn: string;
  kommuneendringer: Kommuneendringer[];
};

export type Kommuneendringer = {
  nummer: string;
  gammeltNavn: string;
  nyttNavn?: string;
  samiskforvaltningsomraade?: boolean;
};

export type Kretsendringer = {
  metadataendringer: Metadataendringer[];
  antallArkiverteGrenser: number;
  antallNyeGrenser: number;
  antallEndredeGrenser: number;
  sammenslaaing: KretsSammenslaaingEndring | null;
  delinger: KretsSplittingEndring[] | null;
};

export type KretsSplittingEndring = { opprinneligKrets: KretsNavnOgNummer; nyeKretser: KretsNavnOgNummer[] };

export type KretsSammenslaaingEndring = {
  nyttNavn: string;
  nyttNummer: string;
  gamleKretser: {
    navn: string;
    nummer: string;
  }[];
};
