/* eslint-disable no-console */
import { WFS } from "ol/format";
import { map } from "pages/Kart/constants";
import { MappedLayer } from "./getLayersFromWMS";
import { getFeaturesFromGeoJson } from "./map/geoJson";
import { KartlagId } from "hooks/layers/types";

export const getWFSFeatures = (id: KartlagId) => {
  const zoom = map.getView().getZoom();

  // TODO: tilbakemelding til brukeren om at zoom > 10 er en grense
  if (zoom && zoom > 10) {
    const extent = map.getView().calculateExtent(map.getSize());
    const request = createWfsRequest(id, extent);
    if (request) {
      try {
        return doGetFeatureRequest(request.path, request.node);
      } catch (Error) {
        console.log("Error: " + Error);
      }
    }
  }
};

export const mapVectorLayer = (id: KartlagId): MappedLayer => {
  return {
    layers: [],
    queryable: true,
    sourceId: id,
    title: id, // TODO: var bare MatrikkelWfsLayer, skal det være noe annet
    id: id, // TODO: var bare MatrikkelWfsLayer, skal det være noe annet
  };
};

const createWfsRequest = (
  id: KartlagId,
  extent: number[],
): { path: string; node: Node } | undefined => {
  if (id === "matrikkelenWfs") {
    return {
      path: "/geoservergeo/wfs/matrikkel",
      node: new WFS({ version: "2.0.0" }).writeGetFeature({
        srsName: "EPSG:25833",
        featureNS: "http://www.statkart.no/matrikkel", // TODO: hvor kommer denne fra?
        featurePrefix: "matrikkel",
        featureTypes: ["TEIGGRENSEWFS"],
        outputFormat: "application/json",
        bbox: extent,
        geometryName: "KURVE", // TODO: hva betyr dette
      }),
    };
  }
};

// TODO: denne gjør en engangs-fetch (post?) av features, tror ikke det er noe vi vil gjøre manuelt egentlig
const doGetFeatureRequest = async (path: string, request: Node) => {
  const response = await fetch(path, {
    method: "POST",
    body: new XMLSerializer().serializeToString(request),
  });

  if (!response.ok) throw new Error("Feil i response: " + response);

  let json = "";

  try {
    json = await response.text();
    console.log("Kartdata mottatt");

    // console.log(json)

    const fetchedFeatures = getFeaturesFromGeoJson(json);
    console.log("Antall features: " + fetchedFeatures.length); // TODO: kan begrenses med "count" i node'n

    return fetchedFeatures;
  } catch (Error) {
    console.log("Error: " + Error + " : " + json);
  }

  // map.render()
};
