import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { featuresToGeoJson, geoJsonToSource } from "./geoJson";
import { getLayerById } from "./layers";
import { LayerId } from "hooks/layers/types";
import { GeometryVectorSource } from "hooks/sources/types";

export const addFeaturesToSource = (
  sourceId: LayerId,
  features: Feature<Geometry>[]
) => {
  const layer = getLayerById(sourceId) as VectorLayer<GeometryVectorSource>;
  const existingSource = layer.getSource();

  if (!existingSource) {
    layer.setSource(new VectorSource({ features }));

    return;
  }

  const existingFeatures = existingSource.getFeatures();

  layer.setSource(
    geoJsonToSource(featuresToGeoJson([...existingFeatures, ...features]))
  );
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
