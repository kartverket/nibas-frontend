import { Point } from "ol/geom";
import { KommuneResponse } from "types/api";
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

export type AvvikPanelProps = {
  isLoadingKommunerMedAvvik: boolean;
  isLoadingAvvik: boolean;
  selectedKommune: KommuneResponse | undefined;
  avvikData: AvvikForKommuneResponse;
  kommunerMedAvvikData: KommuneMedAvvik[];
  pagination: PaginationInfo | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  resetAvvikPanel: () => void;
  handleGoToKommuneClick: (kommuneLokalID: string) => Promise<void>;
};

export interface AvvikRowKommunerProps {
  kommuneMedAvvikItem: KommuneMedAvvik;
  handleGoToKommuneClick: (kommuneLokalID: string) => void;
}

export type AvvikRowProps = {
  findSecondKommune: (kommunerFromRow: KommuneIAvvik[]) => void;
  selectedAvvikId: number | null;
  setSelectedAvvikId: (id: number | null) => void;
  updateStatus: (avvikId: number, status: AvvikStatus) => Promise<boolean>;
  panAndZoom: (coordinates: number[]) => void;
};
export interface AvvikRowPropsExtended extends AvvikRowProps {
  avvikItem: AvvikForKommune;
}
