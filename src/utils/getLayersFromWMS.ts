import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { getTicketForTjeneste } from "./geonorgeTicket";
import { KartlagId } from "hooks/layers/types";
import { getUrlForPath } from "utils/api";
import XYZ from "ol/source/XYZ";

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
  sourceId: KartlagId;
};

const mapWMSLayer = (responseLayer: WMSResponseLayer, sourceId: KartlagId) => {
  let layers: MappedLayer[] = [];

  if (responseLayer.Layer) {
    layers = responseLayer.Layer.map((nestedLayer: WMSResponseLayer) =>
      mapWMSLayer(nestedLayer, sourceId),
    );
  }

  return {
    sourceId,
    layers,
    id: responseLayer.Name,
    title: responseLayer.Title,
    queryable: responseLayer.queryable,
  } as MappedLayer;
};

const mapWMTSLayer = (
  responseLayer: WMTSResponseLayer,
  sourceId: KartlagId,
): MappedLayer => ({
  layers: [],
  queryable: true,
  title: responseLayer.Title,
  id: responseLayer.Identifier,
  sourceId: sourceId,
});

const getSubLayersFromWMSSource = async (source: TileWMS | WMTS | XYZ) => {
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
      url,
    );
    capabilitiesUrl = `${capabilitiesUrl}&ticket=${ticket}`;
  }

  try {
    const response = await fetch(getUrlForPath(capabilitiesUrl));
    const xml = await response.text();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let json: any;

    if (source instanceof TileWMS) {
      json = WMSParser.read(xml);
      if (!json?.Capability) return null;

      const mainLayer = json.Capability.Layer;
      const sourceId = source.get("id") as KartlagId;
      const transformedLayer = mapWMSLayer(mainLayer, sourceId) as MappedLayer;

      return transformedLayer;
    }

    if (source instanceof WMTS) {
      json = WMTSParser.read(xml);

      if (!json?.Contents) return null;

      const sourceId = source.get("id") as KartlagId;
      console.log("getLayersFromWMS", sourceId);

      const mappedWMTSLayer: MappedLayer = {
        layers: json.Contents.Layer.map((l: WMTSResponseLayer) =>
          mapWMTSLayer(l, sourceId),
        ),
        queryable: true,
        sourceId: sourceId,
        title: json.ServiceIdentification.Title ?? source.getLayer(),
        id: sourceId,
      };

      return mappedWMTSLayer;
    }
  } catch {
    return null;
  }
};

export default getSubLayersFromWMSSource;
