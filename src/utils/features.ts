import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Metadata } from "types/api";

export const setDefaultFeatureProperties = (
  feature: Feature<Geometry>,
  grenseType: GrenseType | undefined,
) => {
  feature.setProperties({
    // TODO: Should set some default metadata?
    metadata: {} as Metadata,
    type: grenseType,
    version: 1,
  });
};
