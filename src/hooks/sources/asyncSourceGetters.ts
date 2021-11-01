import { get } from "ol/proj";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";

export const getAdministrativeEnheterKommunerSource = async () => {
  const geojsonRequest = await fetch(
    "/Basisdata_0000_Norge_25833_Kommuner_GEOJSON.geojson"
  );
  const json = await geojsonRequest.json();
  // console.log("Available keys", Object.keys(json));

  return new VectorSource({
    features: new GeoJSON().readFeatures(
      json["administrative_enheter.kommune"],
      {
        dataProjection: get("EPSG:25833"),
      }
    ),
  });
};

export const getAdministrativeEnheterFylkerSource = async () => {
  const geojsonRequest = await fetch(
    "/Basisdata_0000_Norge_25833_Kommuner_GEOJSON.geojson"
  );
  const json = await geojsonRequest.json();
  // console.log("Available keys", Object.keys(json));

  return new VectorSource({
    features: new GeoJSON().readFeatures(
      json["administrative_enheter.fylkesgrense"],
      {
        dataProjection: get("EPSG:25833"),
      }
    ),
  });
};
