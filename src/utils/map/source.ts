import { Feature } from "ol";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";

const parser = new WMTSCapabilities();

export const addFeaturesToSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();

  const newFeatures: Feature<Geometry>[] = [];

  features.forEach((feature) => {
    const id = feature.getId();

    if (!id) return;

    const existingFeature = source.getFeatureById(id);

    // oppdatere eksisterende feature hvis den finnes, så den ikke slettes
    // når nærliggende grense fjernes
    if (existingFeature) {
      const sharedIndex = existingFeature.get("sharedIndex") ?? 0;
      existingFeature.set("sharedIndex", sharedIndex + 1);
      return;
    }

    newFeatures.push(feature);
  });

  source.addFeatures(newFeatures);
};

export const removeFeaturesFromSourceByIds = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();

  const removeFeature = (feature: Feature<Geometry>) => {
    const featureId = feature.getId();

    if (!featureId) return;

    const featureToRemove = source.getFeatureById(featureId);

    // hvis delt, ikke slett
    const sharedIndex = featureToRemove.get("sharedIndex");

    if (sharedIndex !== undefined && sharedIndex > 0) {
      featureToRemove.set("sharedIndex", sharedIndex - 1);
      return;
    }

    // console.log(feature);
    try {
      source.removeFeature(featureToRemove);
    } catch (error) {
      // ikke tryn når vi prøver å fjerne grense som allerede er fjernet
      // dette er en bug, grensen burde ikke ha vært fjernet
    }
  };

  console.log("Removing features", features);

  try {
    features.forEach(removeFeature);
  } catch (error) {
    // TODO fiks det her, den thrower når man skal fjerne grenser som ligger inntil andre grenser
    // hvis den thrower betyr det bare at featuren ikke finnes, og det går fint
  }
};

export const getWMTSOptions = async (
  capabiltiesUrl: string,
  // parameteret til optionsFromCapabilties er også any, så vi vet ikke typen
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionsConfig: any
) => {
  const response = await fetch(capabiltiesUrl);
  const text = await response.text();
  const result = parser.read(text);

  return optionsFromCapabilities(result, optionsConfig);
};
