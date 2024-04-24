import { ReactNode } from "react";
import { GrunnkretsResponse, KretsNavnOgNummer, StemmekretsResponse } from "../../../types/api";

export type Endring = {
  fra: ReactNode;
  til: ReactNode;
};

export type StemmekretsMetadataFields = "navn" | "nummer" | "valgdistriktsnummer";
export type GrunnkretsMetadataFields = "navn" | "nummer";

export type KretsType = "STEMMEKRETS" | "GRUNNKRETS";

export type EndringsFieldFromKretstype<T extends KretsType> = T extends "STEMMEKRETS"
  ? StemmekretsMetadataFields
  : T extends "GRUNNKRETS"
    ? GrunnkretsMetadataFields
    : never;

export type ResponseTypeFromKretstype<T extends KretsType> = T extends "STEMMEKRETS"
  ? StemmekretsResponse
  : T extends "GRUNNKRETS"
    ? GrunnkretsResponse
    : never;

export type KretsMetadataFields = {
  STEMMEKRETS: StemmekretsMetadataFields;
  GRUNNKRETS: GrunnkretsMetadataFields;
};

export type Metadataendringer<T extends KretsType> = T extends "STEMMEKRETS"
  ? { [Key in KretsMetadataFields["STEMMEKRETS"]]: Endring | null }
  : T extends "GRUNNKRETS"
    ? { [Key in KretsMetadataFields["GRUNNKRETS"]]: Endring | null }
    : never;

export type Kretsendringer<T extends KretsType> = {
  kommune: {
    id: string;
    nummer: string;
    navn: string;
  };
  metadataendringer: Metadataendringer<T>[];
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
