import { StemmekretsResponse } from "../../../types/api";

export type Endring<T> = {
  fra: string;
  til: string;
  kretsEndret: T;
};

export type StemmekretsEndring = Endring<StemmekretsResponse>;

export type Endringstype =
  | "stemmekretsnavn"
  | "stemmekretsnummer"
  | "tellekretsnavn"
  | "valgdistriktsnummer"
  | "tellekretsnummer";

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
