import { Feature } from "ol";
import { WFS } from "ol/format";
import GeoJSON from "ol/format/GeoJSON";
import Geometry from "ol/geom/Geometry";
import { map } from "../components/Kart/constants";
import { getFeaturesFromGeoJson } from "./map/geoJson";

export const getMatWFSFeatures = () => {
  const zoom = map.getView().getZoom();

  if (zoom && zoom > 10) {
    const extent = map.getView().calculateExtent(map.getSize());
    console.log("Henter WFS");
    const request: Node = createWfsRequest(extent);
    try {
      return doGetFeatureRequest(request);
    } catch (Error) {
      console.log("Error: " + Error);
    }
  } else {
    // todo gjør bedre!
    alert("Zoom-nivå for lavt: " + zoom + " Minimum 10.");
  }
};

const createWfsRequest = (extent: number[]): Node => {
  return new WFS({ version: "2.0.0" }).writeGetFeature({
    srsName: "EPSG:25833",
    featureNS: "http://www.statkart.no/matrikkel",
    featurePrefix: "matrikkel",
    featureTypes: ["TEIGWFS"],
    outputFormat: "application/json",
    // count: 500,
    bbox: extent,
    geometryName: "FLATE",
  });
};

const doGetFeatureRequest = async (request: Node) => {
  const response = await fetch("/geoservergeo/wfs/MATRIKKEL", {
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
    console.log("Antall features: " + fetchedFeatures.length);

    return fetchedFeatures;
  } catch (Error) {
    console.log("Error: " + Error + " : " + json);
  }

  // map.render()
};
