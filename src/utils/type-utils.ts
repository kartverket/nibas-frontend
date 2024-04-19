import { GRENSETYPER, GrenseType } from "hooks/layers/types";
import Feature, { FeatureLike } from "ol/Feature";
import { LineString } from "ol/geom";

export type Primitive = string | boolean | number | null | undefined;

export const isNil = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined;

export const isNotNil = <T>(value: T | null | undefined): value is T => !isNil(value);

export const isGrenseType = (value: string): value is GrenseType => GRENSETYPER.includes(value as GrenseType);

export const isLineStringFeature = (feature: FeatureLike): feature is Feature<LineString> =>
  feature.getGeometry() instanceof LineString;
