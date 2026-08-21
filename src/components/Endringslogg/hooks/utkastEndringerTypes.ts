import { NonExhaustiveInndelingtype } from "pages/Kart/OverlayPanels/FlatedataPanel/FlatedataTable";
import {
  BopliktomraadeResponse,
  GrunnkretsResponse,
  Inndelingtype,
  KretsNavnOgNummer,
  StemmekretsResponse,
  UtkastOperasjoner,
} from "../../../types/api";

export type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export type EndringsloggInndelingType = Extract<Inndelingtype, "GRUNNKRETS" | "STEMMEKRETS" | "BOPLIKTOMRAADE">;

export type ResponseTypeFromInndelingtype<T extends EndringsloggInndelingType> = T extends "STEMMEKRETS"
  ? StemmekretsResponse
  : T extends "GRUNNKRETS"
    ? GrunnkretsResponse
    : T extends "BOPLIKTOMRAADE"
      ? BopliktomraadeResponse
      : never;

export type Metadataendringer = {
  kretsType: EndringsloggInndelingType;
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
  nyeInndelinger: NyInndelingEndring[];
};

export type NyInndelingEndring = {
  navn: string;
  nummer: string;
  inndelingtype: NonExhaustiveInndelingtype;
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
