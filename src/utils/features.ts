import { GrenseType, getEditingTypeFromGrenseType } from "hooks/layers/types";
import { MetadataDiscriminator, getGrenseDiscriminatorFromType, isAdministrativGrense } from "./grenser";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";
import { FeatureLike } from "ol/Feature";
import { grenserLayers, editableBorderTypes } from "hooks/layers/constants";
import { isNotNullOrUndefined } from "types/common";
import { getRepresentasjonspunktId } from "./map/source";

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

export const isFeatureEditable = (feature: FeatureLike, isArchived: boolean) => {
  const featureType = feature.get("type") as GrenseType;

  if (isAdministrativGrense(featureType)) {
    const properties = feature.getProperties() as FeatureProperties;
    const kontekstEgenskaper = properties.kontekstEgenskaper as KontekstEgenskaper[];

    if (!kontekstEgenskaper || kontekstEgenskaper.length == 0) return false;

    const layerSources = Object.values(grenserLayers)
      .map((layer) => layer.getSource())
      .filter(isNotNullOrUndefined);

    // Kontekstegenskaper inneholder hvilke kretser som grensen tilhører (f. eks stemme/grunnkrets)
    // Alle disse kretsene må være synlige for at en administrativ grense skal være synlig
    // Vi kan sjekke gjennom alle layer sources for å se om lokalIDen til representasjonspunktet er tilgjengelig som en feature.
    // Dersom den er tilgjengelig, kan vi anta at kretsen er synlig
    const alleKretserIKontekstEgenskaperErSynlig = kontekstEgenskaper.every((egenskap) => {
      const lokalId = egenskap.id?.lokalid.value;
      if (!lokalId) return false;

      // TODO Velge riktig layerSource basert på kontekstegenskaptype?
      return layerSources.some((source) => {
        return source.getFeatureById(getRepresentasjonspunktId(lokalId)) != null;
      });
    });

    if (!alleKretserIKontekstEgenskaperErSynlig) return false;
  }

  const isEditableFeatureType = editableBorderTypes.includes(featureType);

  return isEditableFeatureType && !isArchived;
};
