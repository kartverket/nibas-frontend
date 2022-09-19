import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { GrunnkretsRequest, StemmekretsRequest } from "types/api";
import { WithId } from "types/common";

export type Utkast = {
  grunnkretsEndringer?: WithId<GrunnkretsRequest>[];
  stemmekretsEndringer?: WithId<StemmekretsRequest>[];
  grenser?: GeoJSONFeatureCollection[];
};

export type EntityUtkastType = "grunnkretsEndringer" | "stemmekretsEndringer";
export type FeatureUtkastType = "grenser";

export type UtkastResponse = {
  id: string;
};

export type UtkastContextValue = {
  utkast: Utkast;
  hasChanges: boolean;
};

export type UtkastEntity = UtkastResponse | UtkastResponse[] | undefined;
