import { GrunnkretsResponse, KretsNavnOgNummer, StemmekretsResponse } from "../../../types/api";
import { KontekstType } from "pages/Kart/OverlayPanels/hooks/tilhorighet-utils";

export type Endring = {
  fra: string;
  til: string;
};

export type ResponseTypeFromKretstype<T extends KontekstType> = T extends KontekstType.STEMMEKRETS
  ? StemmekretsResponse
  : T extends KontekstType.GRUNNKRETS
    ? GrunnkretsResponse
    : never;

interface IMetadataendringer {
  kretsType: KontekstType;
  opprinneligKrets: {
    navn: string;
    nummer: string;
  };
  navn: string | null | undefined;
  nummer: string | null | undefined;
}

export interface StemmekretsMetadataendringer extends IMetadataendringer {
  kretsType: KontekstType.STEMMEKRETS;
  valgdistriktsnummer: Endring | null;
}

export interface GrunnkretsMetadataendringer extends IMetadataendringer {
  kretsType: KontekstType.GRUNNKRETS;
}

export type Metadataendringer = GrunnkretsMetadataendringer | StemmekretsMetadataendringer;

export type Kretsendringer<KretsMetadataendringer extends IMetadataendringer> = {
  kommune: {
    id: string;
    nummer: string;
    navn: string;
  };
  metadataendringer: KretsMetadataendringer[];
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
