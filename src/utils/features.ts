import { GrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Metadata } from "types/api";
import { getGrenseDiscriminatorFromType } from "./grenser";

export const setDefaultFeatureProperties = (feature: Feature<Geometry>, grenseType: GrenseType | undefined) => {
  if (!grenseType) return;

  feature.setProperties({
    // Metadata er satt kun for at en grense kan valideres før opprettelse uten å endre på metadatafelter.
    metadata: {
      discriminator: getGrenseDiscriminatorFromType(grenseType),
      common: {
        gyldigFra: new Date().toISOString(),
        identifikasjon: {
          lokalid: "NotARealID",
        },
      },
      commonGrense: {},
    } as Metadata,
    type: grenseType,
    version: 1,
  });
};
