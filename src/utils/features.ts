import { GrenseType, getEditingTypeFromGrenseType } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";
import { MetadataDiscriminator, getGrenseDiscriminatorFromType, isAdministrativGrense } from "./grenser";
import { FeatureLike } from "ol/Feature";
import { editableBorderTypes } from "hooks/layers/constants";

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
        oppdateringsdato: new Date().toISOString(),
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
      // Burde sette ID her fra noe? Vet ikke hvordan man kan hente ut inndelingskonteksten automatisk
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

export const featureIsEditable = (feature: FeatureLike, isArchived: boolean) => {
  const featureType = feature.get("type") as GrenseType;

  if (isAdministrativGrense(featureType)) {
    const properties = feature.getProperties() as FeatureProperties;
    const kontekstEgenskaper = properties.kontekstEgenskaper as KontekstEgenskaper[];

    console.log(properties);

    if (!kontekstEgenskaper || kontekstEgenskaper.length == 0) return false;
    // Kontekstegenskaper inneholder hvilke kretser som grensen tilhører (f. eks stemme/grunnkrets)
    // Alle disse kretsene må være synlige for at en administrativ grense skal være synlig
    // Vi vet bare om synligheten til kommuner, og må derfor undersøke alle kontekstegenskapene, finne ut
    // hvilken kommune egenskapen tilhører, og så sjekke om den kommunen er synlig. Hvis den er synlig, kan vi
    // vise den administrative grensen
    console.log("kontekstegenskaper", kontekstEgenskaper);
    for (const egenskap of kontekstEgenskaper) {
      const id = egenskap.id;
      if (!id) continue;
      const lokalId = id.lokalid;
    }

    return false;
  }

  const isEditableFeatureType = editableBorderTypes.includes(featureType);

  return isEditableFeatureType && !isArchived;
};
