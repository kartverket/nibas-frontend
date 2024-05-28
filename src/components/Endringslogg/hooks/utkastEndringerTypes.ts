import { GrunnkretsResponse, KretsNavnOgNummer, StemmekretsResponse, UtkastOperasjoner } from "../../../types/api";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

export type OperasjonerOrNull = UtkastOperasjoner | null | undefined;

export type ResponseTypeFromKretstype<T extends KontekstType> = T extends KontekstType.STEMMEKRETS
  ? StemmekretsResponse
  : T extends KontekstType.GRUNNKRETS
    ? GrunnkretsResponse
    : never;

export type Metadataendringer = {
  kretsType: KontekstType;
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
