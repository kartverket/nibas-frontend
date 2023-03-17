import { GrunnkretsResponse, StemmekretsResponse } from "../../../types/api";

export type Endring<T> = {
  fra: string;
  til: string;
  kretsEndret: T;
};

export type StemmekretsEndring = Endring<StemmekretsResponse>;
export type GrunnkretsEndring = Endring<GrunnkretsResponse>;

export type StemmekretsEndringstype =
  | "stemmekretsnavn"
  | "stemmekretsnummer"
  | "tellekretsnavn"
  | "valgdistriktsnummer"
  | "tellekretsnummer";

export type GrunnkretsEndringstype = "navn" | "grunnkretsnummer";

export type Stemmekretsendringer = {
  kommune: {
    id: string;
    navn: string;
  };
  stemmekretsnavn: StemmekretsEndring[];
  stemmekretsnummer: StemmekretsEndring[];
  tellekretsnummer: StemmekretsEndring[];
  tellekretsnavn: StemmekretsEndring[];
  valgdistriktsnummer: StemmekretsEndring[];
  grensejusteringer: StemmekretsResponse[];
};

export type Grunnkretsendringer = {
  kommune: {
    id: string;
    navn: string;
  };
  navn: GrunnkretsEndring[];
  grunnkretsnummer: GrunnkretsEndring[];
  grensejusteringer: GrunnkretsResponse[];
};
