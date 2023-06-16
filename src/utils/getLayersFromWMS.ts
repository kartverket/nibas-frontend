import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { getTicketForTjeneste } from "./geonorgeTicket";
import { BakgrunnskartId } from "hooks/layers/types";
import { getUrlForPath } from "utils/api";

const WMSParser = new WMSCapabilities();
const WMTSParser = new WMTSCapabilities();

type WMSResponseLayer = {
  Name: string | undefined;
  Title: string;
  queryable: boolean;
  Layer: WMSResponseLayer[];
};

type WMTSResponseLayer = {
  Identifier: string;
  Title: string;
};

export type MappedLayer = {
  layers: MappedLayer[];
  title: string;
  id?: string;
  queryable: boolean;
};

export type MainMappedLayer = MappedLayer & {
  sourceId: BakgrunnskartId;
};

const mapWMSLayer = (responseLayer: WMSResponseLayer) => {
  let layers: MappedLayer[] = [];

  if (responseLayer.Layer) {
    layers = responseLayer.Layer.map((nestedLayer: WMSResponseLayer) =>
      mapWMSLayer(nestedLayer)
    );
  }

  return {
    layers,
    id: responseLayer.Name,
    title: responseLayer.Title,
    queryable: responseLayer.queryable,
  } as MappedLayer;
};

const mapWMTSLayer = (responseLayer: WMTSResponseLayer): MappedLayer => ({
  layers: [],
  queryable: true,
  title: responseLayer.Title,
  id: responseLayer.Identifier,
});

const getSubLayersFromWMSSource = async (source: TileWMS | WMTS) => {
  const urls = source.getUrls();

  if (!urls || urls.length === 0) return null;

  const url = urls[0];

  let capabilitiesUrl: string;

  if (url.includes("?")) {
    capabilitiesUrl = `${url}&request=GetCapabilities`;
  } else {
    capabilitiesUrl = `${url}?request=GetCapabilities`;
  }

  let serviceParam: string;

  if (source instanceof TileWMS) {
    serviceParam = "&service=WMS";
  } else {
    serviceParam = "&service=WMTS";
  }

  capabilitiesUrl += serviceParam;

  if (source.get("protectedTjenesteId")) {
    const ticket = await getTicketForTjeneste(
      source.get("protectedTjenesteId"),
      url
    );
    capabilitiesUrl = `${capabilitiesUrl}&ticket=${ticket}`;
  }

  const response = await fetch(getUrlForPath(capabilitiesUrl));
  const xml = await response.text();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any;

  if (source instanceof TileWMS) {
    json = WMSParser.read(xml);
    // console.log(capabilitiesUrl, json);
    if (!json?.Capability) return null;

    const mainLayer = json.Capability.Layer;
    const transformedLayer = mapWMSLayer(mainLayer) as MainMappedLayer;
    transformedLayer.sourceId = source.get("id") as BakgrunnskartId;

    return transformedLayer;
  }

  if (source instanceof WMTS) {
    json = WMTSParser.read(xml);
    // console.log(capabilitiesUrl, json);

    if (!json?.Contents) return null;

    const mappedWMTSLayer: MainMappedLayer = {
      layers: json.Contents.Layer.map(mapWMTSLayer),
      queryable: true,
      sourceId: source.get("id") as BakgrunnskartId,
      title: json.ServiceIdentification.Title,
      id: json.ServiceIdentification.Title,
    };

    return mappedWMTSLayer;
  }

  return null;
};

export default getSubLayersFromWMSSource;
