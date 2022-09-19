import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";

export type Utkast = {
  grunnkretsendringer?: Record<string, GrunnkretsRequest>;
  stemmekretsendringer?: Record<string, StemmekretsRequest>;
  endredeFeatures?: GeoJSONFeatureCollection[];
};

export type EntityUtkastType = "stemmekretsendringer" | "grunnkretsendringer";
export type FeatureUtkastType = "endredeFeatures";

export type UtkastResponse = {
  id: string;
};

export type UtkastContextValue = {
  utkast: Utkast;
  hasChanges: boolean;
};

export type UtkastEntity = UtkastResponse | UtkastResponse[] | undefined;
