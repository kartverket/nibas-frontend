import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";
import { WithId } from "types/common";

export type Utkast = {
  grunnkretsendringer?: WithId<GrunnkretsRequest>[];
  stemmekretsendringer?: WithId<StemmekretsRequest>[];
  endredeFeatures?: GeoJSONFeatureCollection[];
};

export type EntityUtkastType = "grunnkretsendringer" | "stemmekretsendringer";
export type FeatureUtkastType = "endredeFeatures";

export type UtkastResponse = {
  id: string;
};

export type UtkastContextValue = {
  utkast: Utkast;
  hasChanges: boolean;
};

export type UtkastEntity = UtkastResponse | UtkastResponse[] | undefined;
