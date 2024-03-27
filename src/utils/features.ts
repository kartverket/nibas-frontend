import { GrenseType, LayerId, editableGrenseTypes, getKretstypeFromGrensetype } from "hooks/layers/types";
import { MetadataDiscriminator, getMetadataDiscriminatorFromType, isAdministrativGrense } from "./grenser";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { FeatureProperties, KontekstEgenskaper, Metadata } from "types/api";
import { FeatureLike } from "ol/Feature";
import { grenserLayers } from "hooks/layers/constants";
import { getRepresentasjonspunktId } from "./map/source";
import { previousCoordinateKey } from "pages/Kart/interactions/constants";
import { Coordinate, equals } from "ol/coordinate";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { isGrenseType, isNotNil } from "./type-utils";

export const setDefaultFeatureProperties = (feature: Feature<Geometry>, grenseType: GrenseType | undefined) => {
  if (!grenseType) return;

  const properties = getDefaultFeatureProperties(grenseType);
  if (!properties) return;

  feature.setProperties({
    ...properties,
  });
};

/**
 * Returns the first feature found which matches the featureId parameter. If not present returns null
 * @param featureId Feature to find
 * @returns Feature<Geometry> | null
 */
export const getFeatureIfExistsInAnyLayer = (featureId: string) => {
  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (source) {
      const feature = source.getFeatureById(featureId);

      if (feature) return feature as Feature<Geometry>;
    }
  }

  return null;
};

/**
 * Removes the feature from all and any layer it may exist in.
 * @param featureId Feature to remove
 * @returns Integer. The number of layers it was removed from, or -1 if none.
 */
export const removeFeatureFromAllLayers = (featureId: string) => {
  let numberOfRemoves = 0;
  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (source) {
      const feature = source.getFeatureById(featureId);
      if (feature) {
        source.removeFeature(feature);
        ++numberOfRemoves;
      }
    }
  }
  return numberOfRemoves > 0 ? numberOfRemoves : -1;
};

export const getFeaturesConnectedToFeatureAtEndpoints = (connectedToFeature: Feature<Geometry>) => {
  const connectedFeatures: Feature<Geometry>[] = [];
  const geometry = connectedToFeature.getGeometry();
  if (!geometry || !(geometry instanceof LineString)) return [];

  const firstCoordConnectedFeature = geometry.getFirstCoordinate();
  const lastCoordConnectedFeature = geometry.getLastCoordinate();

  for (const layer of Object.values(grenserLayers)) {
    const source = layer.getSource();

    if (!source) continue;

    for (const feature of source.getFeatures()) {
      if (feature.getId() !== connectedToFeature.getId()) {
        const featureToCheckGeometry = feature.getGeometry();
        if (!featureToCheckGeometry || !(featureToCheckGeometry instanceof LineString)) continue;

        const firstCoordFeatureToCheck = featureToCheckGeometry.getFirstCoordinate();
        const lastCoordFeatureToCheck = featureToCheckGeometry.getLastCoordinate();

        if (
          equals(firstCoordConnectedFeature, firstCoordFeatureToCheck) ||
          equals(firstCoordConnectedFeature, lastCoordFeatureToCheck) ||
          equals(lastCoordConnectedFeature, firstCoordFeatureToCheck) ||
          equals(lastCoordConnectedFeature, lastCoordFeatureToCheck)
        ) {
          connectedFeatures.push(feature);
        }
      }
    }
  }

  return connectedFeatures;
};

export const getAllFeatureEndPointCoordinates = (layerIdsToFilter: LayerId[]): (FeatureIdWithEndpoints | null)[] => {
  return Object.entries(grenserLayers)
    .flatMap(([key, layer]) => {
      if (layerIdsToFilter.includes(key as LayerId)) return [];

      const source = layer.getSource();
      if (source) return source.getFeatures();

      return [];
    })
    .flatMap((f) => {
      const geom = f.getGeometry();
      const id = f.getId()?.toString();
      if (geom && geom instanceof LineString && id != null)
        return { featureId: id, endpoints: { first: geom.getFirstCoordinate(), last: geom.getLastCoordinate() } };

      return null;
    });
};

export type FeatureIdWithEndpoints = {
  featureId: string;
  endpoints: {
    first: Coordinate;
    last: Coordinate;
  };
};

/** Tar inn en grense og prøver å avgjøre om den er koblet til andre grenser i begge ender */
export const isFeatureDeadEnd = (feature: Feature<Geometry>, allFeatureEndpoints: FeatureIdWithEndpoints[]) => {
  const geometry = feature.getGeometry() as LineString;
  const coordinates = geometry?.getCoordinates() as Coordinate[];

  const head = coordinates[0];
  const tail = coordinates[coordinates.length - 1];

  if (equals(head, tail)) {
    return false;
  }

  const featureEndpointsToCheck = allFeatureEndpoints.filter(
    (featureEndpoint) => featureEndpoint.featureId !== feature.getId()?.toString(),
  );

  const isHeadConnected2 = featureEndpointsToCheck.find(
    (featureEndPoint) => equals(featureEndPoint.endpoints.first, head) || equals(featureEndPoint.endpoints.last, head),
  );

  const isTailConnected2 = featureEndpointsToCheck.find(
    (featureEndPoint) => equals(featureEndPoint.endpoints.first, tail) || equals(featureEndPoint.endpoints.last, tail),
  );

  const test = !(isHeadConnected2 && isTailConnected2);

  return test;
};

const getDefaultFeatureMetadata = (discriminator: MetadataDiscriminator): Metadata => {
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
  const metadataDiscriminator = getMetadataDiscriminatorFromType(grenseType);
  const kretstype = getKretstypeFromGrensetype(grenseType);

  if (!metadataDiscriminator || !kretstype) return null;

  const metadata: Metadata = getDefaultFeatureMetadata(metadataDiscriminator);

  const properties: FeatureProperties = {
    inndelingerKontekst: {
      // Burde sette ID her fra noe? Vet ikke hvordan man kan hente ut inndelingskonteksten automatisk
      id: "",
      type: kretstype,
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
  const isMetadataEditable = isFeatureMetadataEditable(feature, isArchived);

  const featureType = feature.get("type");

  if (isGrenseType(featureType) && isAdministrativGrense(featureType)) {
    if (isTempFeatureId(feature.getId())) return true;

    const properties = feature.getProperties() as FeatureProperties;
    const kontekstEgenskaper = properties.kontekstEgenskaper as KontekstEgenskaper[];

    if (kontekstEgenskaper.length === 0) return false;

    const layerSources = Object.values(grenserLayers)
      .map((layer) => layer.getSource())
      .filter(isNotNil);

    // Kontekstegenskaper inneholder hvilke kretser som grensen tilhører (f. eks stemme/grunnkrets)
    // Alle disse kretsene må være synlige for at en administrativ grense skal være synlig
    // Vi kan sjekke gjennom alle layer sources for å se om lokalIDen til representasjonspunktet er tilgjengelig som en feature.
    // Dersom den er tilgjengelig, kan vi anta at kretsen er synlig
    const alleKretserIKontekstEgenskaperErSynlig = kontekstEgenskaper.every((egenskap) => {
      const lokalId = egenskap.id?.lokalid.value;
      if (lokalId === undefined) return false;

      // TODO Velge riktig layerSource basert på kontekstegenskaptype?
      return layerSources.some((source) => source.getFeatureById(getRepresentasjonspunktId(lokalId)) !== null);
    });

    if (!alleKretserIKontekstEgenskaperErSynlig) return false;
  }

  return isMetadataEditable;
};

export const isFeatureMetadataEditable = (feature: FeatureLike, isArchived: boolean) => {
  const featureType = feature.get("type");
  const isEditableFeatureType = isGrenseType(featureType) && editableGrenseTypes.includes(featureType);
  return isEditableFeatureType && !isArchived;
};

export const isPreviousAndCurrentCoordinatesEqual = (feature: Feature<LineString>) => {
  const previousFeatureCoordinates = feature.get(previousCoordinateKey) as Coordinate[] | undefined;
  const currentFeatureCoordinates = feature.getGeometry()?.getCoordinates();

  if (previousFeatureCoordinates && currentFeatureCoordinates) {
    for (let i = 0; i < previousFeatureCoordinates.length; i++) {
      if (equals(previousFeatureCoordinates[i], currentFeatureCoordinates[i])) continue;

      return false;
    }
  }
  return true;
};

export const isMatrikkelFeature = (feature: FeatureLike) => {
  const featureId = feature.getId()?.toString();

  if (featureId != null) {
    return featureId.includes("TEIGGRENSEWFS");
  }

  return false;
};
