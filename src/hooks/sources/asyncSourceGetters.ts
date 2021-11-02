import { geoJsonToSource } from "utils/map/geoJson";

export const getAdministrativeEnheterKommunerSource = async () => {
  const geojsonRequest = await fetch(
    "/v1/feature/administrativeEnheter?type=Kommune&administrativeEnheterNummer=1,2"
  );
  const json = await geojsonRequest.json();

  return geoJsonToSource(json);
};

export const getAdministrativeEnheterFylkerSource = async () => {
  const geojsonRequest = await fetch(
    "/Basisdata_0000_Norge_25833_Kommuner_GEOJSON.geojson"
  );
  const json = await geojsonRequest.json();

  return geoJsonToSource(json["administrative_enheter.fylkesgrense"]);
};
