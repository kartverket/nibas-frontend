import WMSCapabilities from "ol/format/WMSCapabilities";
import { TileWMS } from "ol/source";
import { getTicketForTjeneste } from "./geonorgeTicket";
import { BakgrunnskartId } from "hooks/layers/types";

const parser = new WMSCapabilities();

type ResponseLayer = {
  Name: string | undefined;
  Title: string;
  queryable: boolean;
  Layer: ResponseLayer[];
};

export type MappedLayer = {
  layers: MappedLayer[];
  title: string;
  name?: string;
  queryable: boolean;
};

export type MainMappedLayer = MappedLayer & {
  sourceId: BakgrunnskartId;
};

const mapLayer = (responseLayer: ResponseLayer) => {
  let layers: MappedLayer[] = [];

  if (responseLayer.Layer) {
    layers = responseLayer.Layer.map((nestedLayer: ResponseLayer) =>
      mapLayer(nestedLayer)
    );
  }

  return {
    layers,
    name: responseLayer.Name,
    title: responseLayer.Title,
    queryable: responseLayer.queryable,
  } as MappedLayer;
};

const getSubLayersFromWMSSource = async (source: TileWMS) => {
  const urls = source.getUrls();

  if (!urls || urls.length === 0) return null;

  const url = urls[0];
  let capabilitiesUrl = `${url}&request=GetCapabilities`;

  if (source.get("protectedTjenesteId")) {
    const ticket = await getTicketForTjeneste(
      source.get("protectedTjenesteId"),
      url
    );
    capabilitiesUrl = `${capabilitiesUrl}&ticket=${ticket}`;
  }

  const response = await fetch(capabilitiesUrl);
  const xml = await response.text();

  const json = parser.read(xml);

  if (!json?.Capability) return null;

  const mainLayer = json.Capability.Layer;
  const transformedLayer = mapLayer(mainLayer) as MainMappedLayer;
  transformedLayer.sourceId = source.get("id") as BakgrunnskartId;

  return transformedLayer;
};

export default getSubLayersFromWMSSource;
