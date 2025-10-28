import { Point } from "ol/geom";
import { KommuneResponse } from "types/api";
import { components } from "types/api-gen-arbeidsliste";

export type KommuneParMedAvvik = components["schemas"]["KommuneParAvvikDTO"];
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
  geometri: {
    type: string;
    coordinates: number[][];
  };
}

export interface AvvikKommunerResponse extends PaginationInfo {
  content: KommuneParMedAvvik[];
  empty: boolean;
}
export type AvvikForKommuneResponse = AvvikForKommune[];

export enum AvvikStatus {
  NY = "NY",
  FIKSET = "FIKSET",
  VENT = "VENT",
}

type handleGotoKommuneParType = (kommuneParMedAvvikItem: KommuneParMedAvvik) => void;

export type AvvikPanelProps = {
  isLoadingKommuneParMedAvvik: boolean;
  isLoadingAvvik: boolean;
  selectedKommuner: KommuneResponse[] | undefined;
  avvikData: AvvikForKommuneResponse | undefined;
  kommuneParMedAvvikData: KommuneParMedAvvik[];
  pagination: PaginationInfo | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  resetAvvikPanel: () => void;
  handleGotoKommunePar: handleGotoKommuneParType;
};

export interface AvvikRowKommunerProps {
  kommuneParMedAvvikItem: KommuneParMedAvvik;
  handleGotoKommunePar: handleGotoKommuneParType;
}

export type AvvikRowProps = {
  selectedAvvikId: number | null;
  setSelectedAvvikId: (id: number | null) => void;
  updateStatus: (avvikId: number, status: AvvikStatus) => Promise<boolean>;
};
export interface AvvikRowPropsExtended extends AvvikRowProps {
  avvikItem: AvvikForKommune;
}
