import { TileWMS } from "ol/source";
import WMSCapabilities from "ol/format/WMSCapabilities";

const parser = new WMSCapabilities();

export type MappedLayer = {
  layers: MappedLayer[];
  title: string;
  name?: string;
  queryable: boolean;
};

const mapLayer = (responseLayer: any): MappedLayer | null => {
  let layers: MappedLayer[] = [];

  if (responseLayer.Layer) {
    layers = responseLayer.Layer.map((nestedLayer: any) =>
      mapLayer(nestedLayer)
    ).filter(Boolean); // fjerner falsy entries
  }

  return {
    layers,
    name: responseLayer.Name,
    title: responseLayer.Title,
    queryable: responseLayer.queryable,
  };
};

const getLayersFromWMS = async (source: TileWMS) => {
  const urls = source.getUrls();

  if (!urls || urls.length === 0) return null;

  const url = urls[0];
  const capabilitiesUrl = `${url}&Request=GetCapabilities`;

  const response = await fetch(capabilitiesUrl);
  const xml = await response.text();

  const json = parser.read(xml);
  const mainLayer = json.Capability.Layer;
  const transformedLayer = mapLayer(mainLayer);

  return transformedLayer;
};

export default getLayersFromWMS;
