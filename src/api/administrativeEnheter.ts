import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { featuresToGeoJson } from "utils/map/geoJson";

type AdministrativEnhetType = "FYLKE" | "KOMMUNE";

export const fetchAdministrativEnhet = async (type: AdministrativEnhetType) => {
  const geojsonRequest = await fetch(`v1/administrativ-enhet?type=${type}`);
  const json = await geojsonRequest.json();

  return json;
};

export const fetchAdministrativEnhetFeaturesById = async (
  id: number,
  type: AdministrativEnhetType
) => {
  const geojsonRequest = await fetch(
    `v1/feature/administrative-enheter?type=${type}&ider=${id}`
  );
  const json = await geojsonRequest.json();

  return json;
};

export const updateAdministrativEnhetFeatures = async (
  features: Feature<Geometry>[],
  type: AdministrativEnhetType
) => {
  const geoJson = featuresToGeoJson(features);

  const results = await fetch(`v1/feature/grenser?type=${type}&ider=${0}`, {
    method: "PUT",
    body: geoJson,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // eslint-disable-next-line no-console
  console.log(results);
};
