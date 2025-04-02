import { Point } from "ol/geom";

export interface KommunerMedAvvik {
  kommuneNavn: string;
  kommuneNummer: string;
  kommuneLokalID: string;
  fylkesLokalID: string;
  antallAvvik: number;
}
export interface KommunerIAvvik {
  //TODO: Gjøre disse like i backend-responsen
  kommunenavn: string;
  kommunenummer: string;
  kommuneLokalID: string;
  fylkesLokalID: string;
}
export interface KoordinaterMedAvvik {
  nibasKoordinat: {
    type: Point;
    coordinates: number[];
  };
  matrikkelKoordinat: {
    type: Point;
    coordinates: number[];
  };
}
export interface AvvikForKommune {
  fylkeId: string;
  kommuneId: string;
  id: number; // ID for avviket
  lokalId: string;
  status: string;
  antallKoordinater: number;
  antallKoordinaterMedAvvik: number;
  koordinaterMedAvvik: KoordinaterMedAvvik[];
  kommuner: KommunerIAvvik[];
}

export interface PaginationInfo {
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
export interface AvvikKommunerResponse extends PaginationInfo {
  content: KommunerMedAvvik[];
  empty: boolean;
}
export type AvvikForKommuneResponse = AvvikForKommune[];
