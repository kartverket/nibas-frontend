import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { featuresToGeoJson } from "utils/map/geoJson";

export const updateGrenser = async (
  features: Feature<Geometry>[],
  token: string | undefined
) => {
  const geoJson = JSON.stringify(featuresToGeoJson(features));

  const results = await fetch(`v1/grenser`, {
    method: "POST",
    body: geoJson,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  // eslint-disable-next-line no-console
  console.log(results);
};
