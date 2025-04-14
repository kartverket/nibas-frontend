import { Point } from "ol/geom";
import { components } from "types/api-gen-arbeidsliste";

export type KommuneMedAvvik = components["schemas"]["KommuneAvvikDTO"];
export type PaginationInfo = components["schemas"]["Page"];
export type PageableObject = components["schemas"]["PageableObject"];
export type SortObject = components["schemas"]["SortObject"];
export interface KommuneIAvvik {
  //TODO: Gjøre disse like i backend-responsen?
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
  status: AvvikStatus;
  antallKoordinater: number;
  antallKoordinaterMedAvvik: number;
  koordinaterMedAvvik: KoordinaterMedAvvik[];
  kommuner: KommuneIAvvik[];
}

export interface AvvikKommunerResponse extends PaginationInfo {
  content: KommuneMedAvvik[];
  empty: boolean;
}
export type AvvikForKommuneResponse = AvvikForKommune[];

export enum AvvikStatus {
  NY = "NY",
  FIKSET = "FIKSET",
  VENT = "VENT",
}
