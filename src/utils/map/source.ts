import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import WMTS from "ol/source/WMTS";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";

export const addFeaturesToSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const existingSource = layer.getSource();

  existingSource.addFeatures(features);
};

export const removeFeaturesFromSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const source = layer.getSource();

  features.forEach((feature) => {
    source.removeFeature(feature);
  });
};
