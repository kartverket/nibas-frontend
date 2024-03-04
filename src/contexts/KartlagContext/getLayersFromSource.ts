import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { getTicketForTjeneste } from "../../utils/geonorgeTicket";
import { KartlagId } from "hooks/layers/types";
import { getUrlForPath } from "utils/api";
import { MappedLayer } from "contexts/KartlagContext/KartlagContext";

const WMSParser = new WMSCapabilities();
const WMTSParser = new WMTSCapabilities();

type WMSResponseLayer = {
  Name: string;
  Title: string;
  queryable: boolean;
  Layer: WMSResponseLayer[];
};

type WMTSResponseLayer = {
  Identifier: string;
  Title: string;
};

const mapWMSLayer = (responseLayer: WMSResponseLayer, sourceId: KartlagId) => {
  let layers: MappedLayer[] = [];

  if (responseLayer.Layer) {
    layers = responseLayer.Layer.map((nestedLayer: WMSResponseLayer) => mapWMSLayer(nestedLayer, sourceId));
  }

  const mappedLayer: MappedLayer = {
    type: "wms",
    sourceId,
    id: responseLayer.Name,
    title: responseLayer.Title,
    layers,
    isVisible: false,
  };

  return mappedLayer;
};

const mapWMTSLayer = (responseLayer: WMTSResponseLayer, sourceId: KartlagId): MappedLayer => ({
  type: "wmts",
  sourceId: sourceId,
  id: responseLayer.Identifier,
  title: responseLayer.Title,
  layers: [],
  isVisible: false,
});

export const getLayersFromSource = async (source: TileWMS | WMTS) => {
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
    const ticket = await getTicketForTjeneste(source.get("protectedTjenesteId"), url);
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

      return mapWMSLayer(mainLayer, sourceId);
    }

    if (source instanceof WMTS) {
      json = WMTSParser.read(xml);

      if (!json?.Contents) return null;

      const sourceId = source.get("id") as KartlagId;

      const mappedWMTSLayer: MappedLayer = {
        type: "wmts",
        sourceId: sourceId,
        id: sourceId,
        title: json.ServiceIdentification.Title ?? source.getLayer(),
        layers: json.Contents.Layer.map((l: WMTSResponseLayer) => mapWMTSLayer(l, sourceId)),
        isVisible: false,
      };

      return mappedWMTSLayer;
    }
  } catch {
    // TODO: bedre feilhåndtering
    return null;
  }
};
