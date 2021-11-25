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
  const enhetsnumre = features.reduce<string[]>((accumulator, feature) => {
    const enhetsnummer = feature.getProperties().administrativEnhet.nummer;

    if (accumulator.includes(enhetsnummer)) return accumulator;

    accumulator.push(enhetsnummer);

    return accumulator;
  }, []);

  // console.log("Fylker to update", fylkesnumre);

  const updateRequests = enhetsnumre.map((fylkesnummer) => {
    const fylkeFeatures = features.filter(
      (feature) =>
        feature.getProperties().administrativEnhet.nummer === fylkesnummer
    );
    const geoJson = featuresToGeoJson(fylkeFeatures);
    // console.log(geoJson);

    return fetch(`v1/feature/grenser?type=${type}&ider=${fylkesnummer}`, {
      method: "PUT",
      body: geoJson,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  const results = await Promise.all(updateRequests);
  // eslint-disable-next-line no-console
  console.log(results);
};
