import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { featuresToGeoJson } from "utils/map/geoJson";

export const updateGrenser = async (features: Feature<Geometry>[]) => {
  const geoJson = featuresToGeoJson(features);

  const results = await fetch(`v1/grenser`, {
    method: "PUT",
    body: geoJson,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // eslint-disable-next-line no-console
  console.log(results);
};
