import { GrunnkretsResponse, KretsNavnOgNummer, StemmekretsResponse } from "../../../types/api";

export type Endring = {
  fra: string;
  til: string;
};

export type StemmekretsMetadataFields = "navn" | "nummer" | "valgdistriktsnummer";
export type GrunnkretsMetadataFields = "navn" | "nummer";

export type KretsType = "STEMMEKRETS" | "GRUNNKRETS";

export type ResponseTypeFromKretstype<T extends KretsType> = T extends "STEMMEKRETS"
  ? StemmekretsResponse
  : T extends "GRUNNKRETS"
    ? GrunnkretsResponse
    : never;

interface IMetadataendringer {
  kretsType: KretsType;
  opprinneligKrets: {
    navn: string;
    nummer: string;
  };
  navn: string | null | undefined;
  nummer: string | null | undefined;
}

export interface StemmekretsMetadataendringer extends IMetadataendringer {
  kretsType: "STEMMEKRETS";
  valgdistriktsnummer: Endring | null;
}

export interface GrunnkretsMetadataendringer extends IMetadataendringer {
  kretsType: "GRUNNKRETS";
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
