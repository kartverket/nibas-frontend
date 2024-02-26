import {
  GrunnkretsResponse,
  KretsDelingEndringRequest,
  KretsNavnOgNummer,
  StemmekretsResponse,
} from "../../../types/api";

export type Endring = {
  fra: string;
  til: string;
};

export type StemmekretsMetadataEndringstype = "stemmekretsnavn" | "stemmekretsnummer" | "valgdistriktsnummer";

export type GrunnkretsEndringstype = "navn" | "grunnkretsnummer";

export type StemmekretsMetadataEndring = {
  kretsEndret: StemmekretsResponse;
  stemmekretsnavn: Endring | null | undefined;
  stemmekretsnummer: Endring | null | undefined;
  valgdistriktsnummer: Endring | null | undefined;
};

export type GrunnkretsMetadataEndring = {
  kretsEndret: GrunnkretsResponse;
  navn: Endring | null | undefined;
  grunnkretsnummer: Endring | null | undefined;
};

export type Stemmekretsendringer = {
  kommune: {
    id: string;
    nummer: string;
    navn: string;
  };
  metadataendringer: StemmekretsMetadataEndring[];
  grensejusteringer: StemmekretsResponse[];
  sammenslaaing: StemmekretsSammenslaaingEndring | null;
  deling: KretsDelingEndring[] | null;
};

export type Grunnkretsendringer = {
  kommune: {
    id: string;
    nummer: string;
    navn: string;
  };
  metadataendringer: GrunnkretsMetadataEndring[];
  grensejusteringer: GrunnkretsResponse[];
  delinger: KretsDelingEndring[] | null;
};

export type KretsDelingEndring = { opprinneligKrets: KretsNavnOgNummer; nyeKretser: KretsNavnOgNummer[] };

export type StemmekretsSammenslaaingEndring = {
  viderefoertKrets: StemmekretsResponse;
  nyttNavn: string;
  nyttNummer: string;
  gamleKretser: {
    navn: string;
    nummer: string;
  }[];
};
