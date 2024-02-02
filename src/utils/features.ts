import { GrenseType, getEditingTypeFromGrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties, Metadata } from "types/api";
import { MetadataDiscriminator, getGrenseDiscriminatorFromType } from "./grenser";

export const setDefaultFeatureProperties = (feature: Feature<Geometry>, grenseType: GrenseType | undefined) => {
  if (!grenseType) return;

  const properties = getDefaultFeatureProperties(grenseType);
  if (!properties) return;

  feature.setProperties({
    ...properties,
  });
};

export const getDefaultFeatureMetadata = (discriminator: MetadataDiscriminator): Metadata => {
  return {
    discriminator: discriminator,
    common: {
      gyldigFra: new Date().toISOString(),
      identifikasjon: {
        lokalid: "NotARealID",
      },
      sporingsinformasjon: {
        oppdateringsdato: "",
      },
      datafangstdato: "",
    },
    commonGrense: {},
    dokumentasjonsreferanser: [],
  };
};

export const getDefaultFeatureProperties = (grenseType: GrenseType): FeatureProperties | null => {
  const grenseDiscriminator = getGrenseDiscriminatorFromType(grenseType);
  const editingType = getEditingTypeFromGrenseType(grenseType);

  if (!grenseDiscriminator || !editingType) return null;

  const metadata: Metadata = getDefaultFeatureMetadata(grenseDiscriminator);

  const properties: FeatureProperties = {
    inndelingerKontekst: {
      id: "",
      type: editingType,
    },
    kontekstEgenskaper: [],
    shouldArchive: false,
    srid: 25833,
    type: grenseType,
    version: 1,
    metadata: metadata,
  };

  return properties;
};
