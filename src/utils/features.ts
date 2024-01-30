import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Metadata } from "types/api";
import { getGrenseDiscriminatorFromType } from "./grenser";

export const setDefaultFeatureProperties = (
  feature: Feature<Geometry>,
  grenseType: GrenseType | undefined,
) => {
  if (!grenseType) return;

  feature.setProperties({
    // TODO: Should set some default metadata?
    metadata: {
      discriminator: getGrenseDiscriminatorFromType(grenseType),
      common: {},
      commonGrense: {},
    } as Metadata,
    type: grenseType,
    version: 1,
  });
};
