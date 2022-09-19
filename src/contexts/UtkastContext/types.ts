import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";

export type Utkast = {
  grunnkretser?: Record<string, GrunnkretsRequest>;
  stemmekretser?: Record<string, StemmekretsRequest>;
  grenser?: GeoJSONFeatureCollection[];
};

export type EntityUtkastType = "stemmekretser" | "grunnkretser";
export type FeatureUtkastType = "grenser";

export type UtkastResponse = {
  id: string;
};

export type UtkastContextValue = {
  utkast: Utkast;
  hasChanges: boolean;
};

export type UtkastEntity = UtkastResponse | UtkastResponse[] | undefined;
