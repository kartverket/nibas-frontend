import { WMTSConfig } from "hooks/layers/kartlagSources";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import TileLayer from "ol/layer/Tile";
import TileSource from "ol/source/Tile";
import TileWMS from "ol/source/TileWMS";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { getLayerById } from "utils/map/layers";
import { EpsgCode } from "utils/map/projections";
import { MappedLayer } from "./KartlagContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { FeatureProperties } from "types/api";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

/**
 * Navigerer rekursivt gjennom kartlagene for å finne laget som skal endres
 *
 * @param depth Hvor dypt vi er i trestrukturen
 * @param layers Lagene vi skal søke gjennom
 * @param indexPath En snarvei som peker oss til hvilket underlag brukeren trykket pp
 * @param willBeVisible Hvorvidt kartlaget skal bli synlig til slutt eller ikke
 * @returns En liste med endre kartlag for å kunne bygge en ny trestruktur
 */
export const toggleLayerVisibility = (
  depth: number,
  layers: MappedLayer[],
  indexPath: number[],
  willBeVisible: boolean,
): MappedLayer[] => {
  let modifiedLayer: MappedLayer;
  let nextLayer: MappedLayer = layers[indexPath[depth]];

  // WMTS-lag kan kun ha ett underlag på om gangen, så alle lagene tilbakestilles i starten
  if (depth === 0 && nextLayer.type === "wmts") {
    nextLayer = {
      ...nextLayer,
      sublayers: nextLayer.sublayers.map((ml) => toggleAllSublayers(ml, false)),
    };
  }

  // Når vi når enden av indexPath har vi funnet laget vi skal endre, og må oppdatere alle underlagene den har rekursivt
  if (depth === indexPath.length - 1) {
    if (nextLayer.type === "wmts") {
      modifiedLayer = toggleWMTSLayer(nextLayer, willBeVisible);
    } else {
      modifiedLayer = toggleAllSublayers(nextLayer, willBeVisible);
    }
  } else {
    // Hvis vi ikke har nådd enden enda fortsetter vi å søke lengre ned rekursivt
    const newSublayers = toggleLayerVisibility(depth + 1, nextLayer.sublayers, indexPath, willBeVisible);

    // Et lag skal kun vises som synlig dersom alle etterkommere vises som synlig også
    modifiedLayer = {
      ...nextLayer,
      sublayers: newSublayers,
      isVisible: newSublayers.some((sl) => sl.isVisible),
    };
  }
  // Vi må opprette treet av mappedLayers på nytt med de endrede lagene
  const head = layers.slice(0, indexPath[depth]);
  const tail = layers.slice(indexPath[depth] + 1);
  return [...head, modifiedLayer, ...tail];
};

// Dersom et kartlag har underlag må vi passe på at de blir skrudd av eller på også
const toggleAllSublayers = (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
  // Dersom laget ikke har underlag kan vi avslutte rekursjon og skru av eller på kartlaget
  if (layer.sublayers.length === 0) {
    if (layer.type === "wms") {
      setWMSLayerVisibility(getLayerById(layer.sourceId), willBeVisible, layer.id);
    }
    return { ...layer, isVisible: willBeVisible };
  }

  // Fortsett rekursjonen dersom det er flere underlag
  return {
    ...layer,
    isVisible: willBeVisible,
    sublayers: layer.sublayers.map((sublayer) => toggleAllSublayers(sublayer, willBeVisible)),
  };
};

// Kun ett lag kan være skrudd på om gangen for WMTS-lag, så de må håndteres på en spesiell måte
const toggleWMTSLayer = (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
  const sourceLayer = getLayerById(layer.sourceId);

  // Dersom laget som skal toggles ikke har underlag setter vi det bare til riktig verdi
  if (layer.sublayers.length === 0) {
    setWMTSLayerVisibility(sourceLayer, willBeVisible, layer.id);
    return {
      ...layer,
      isVisible: willBeVisible,
    };
  }

  // Dersom laget har underlag må vi sjekke hvilket underlag som skal bli markert som synlig
  const toggledLayerId = setWMTSLayerVisibility(sourceLayer, willBeVisible);

  return {
    ...layer,
    isVisible: willBeVisible,
    sublayers: layer.sublayers.map((sublayer) => toggleWMTSSublayer(sublayer, toggledLayerId, willBeVisible)),
  };
};

const toggleWMTSSublayer = (layer: MappedLayer, toggledLayerId: string, willBeVisible: boolean): MappedLayer => {
  if (layer.sublayers.length === 0) {
    if (layer.id === toggledLayerId) {
      return { ...layer, isVisible: willBeVisible };
    }
    return layer;
  }
  return {
    ...layer,
    isVisible: willBeVisible,
    sublayers: layer.sublayers.map((sublayer) => toggleWMTSSublayer(sublayer, toggledLayerId, willBeVisible)),
  };
};

export const findAndToggleLayer = (layerId: string, layers: MappedLayer[]) => {
  // Må finne ut hvor i trestrukturen laget er
  const findings = findMappedLayer(layerId, layers);
  if (findings) {
    // Og deretter må vi gjennom standard rekursjon og bubbling for å toggle laget
    return toggleLayerVisibility(0, layers, findings.indexPath, !findings.mappedLayer.isVisible);
  }
  // Hvis vi ikke fant default-laget i trestrukturen returnerer vi trestrukturen som den var
  return layers;
};

// Prøver å finne et lag med en gitt id i trestrukturen uten å endre på trestrukturen
const findMappedLayer = (
  id: string,
  layers: MappedLayer[],
): { mappedLayer: MappedLayer; indexPath: number[] } | undefined => {
  // Utrolig nok er enkel for-løkke best ytelse her, da vi trenger index og må kunne returnere fra løkken
  for (let index = 0; index < layers.length; index++) {
    const layer = layers[index];
    if (layer.id === id) {
      return { mappedLayer: layer, indexPath: [index] };
    }
    const findings = findMappedLayer(id, layer.sublayers);
    if (findings) {
      return { mappedLayer: findings.mappedLayer, indexPath: [index, ...findings.indexPath] };
    }
  }
  return undefined;
};

const removeLayer = (layers: string, layerId: string) => {
  const commaRegex = new RegExp(`(,?)(${layerId})(,?)`, "i");
  const matches = commaRegex.exec(layers);
  if (!matches) return layers;

  const hasLeadingComma = matches.at(1) === ",";
  const hasTrailingComma = matches.at(3) === ",";
  let replaceString = "";

  if (hasTrailingComma) {
    // komma på slutten, potensielt på starten i tillegg men spiller ingen rolle
    replaceString = `${layerId},`;
  } else if (hasLeadingComma) {
    // bare komma på starten
    replaceString = `,${layerId}`;
  } else {
    // ikke noe komma
    replaceString = `${layerId}`;
  }

  return layers.replace(replaceString, "");
};

export const setWMSLayerVisibility = (layer: TileLayer<TileSource>, willBeVisible: boolean, layerId: string) => {
  const source = layer.getSource();
  if (source instanceof TileWMS) {
    const layers = source.getParams().LAYERS as string;

    if (willBeVisible) {
      source.updateParams({ LAYERS: layers ? `${layers},${layerId}` : layerId });
      layer.setVisible(true);
    } else {
      const newLayers = removeLayer(layers, layerId);
      source.updateParams({ LAYERS: newLayers });
      if (!newLayers) layer.setVisible(false);
    }
  }
};

export const resetWMSLayer = (layer: TileLayer<TileSource>) => {
  const source = layer.getSource();
  if (source instanceof TileWMS) {
    source.updateParams({ LAYERS: "" });
    layer.setVisible(false);
  }
};

export const setWMTSLayerVisibility = (layer: TileLayer<TileSource>, willBeVisible: boolean, newLayerId?: string) => {
  const source = layer.getSource();
  if (source instanceof WMTS) {
    // OpenLayers lar deg ikke sette layer for WMTS-lag, så vi må bytte ut hele sourcen med ny layer-verdi
    const config = source.get("config");
    const newLayer = newLayerId ?? (config.layer as string);
    const newSource = new WMTS({
      ...config,
      layer: newLayer,
    });
    newSource.set("config", config);
    layer.setSource(newSource);
    layer.setVisible(willBeVisible);
    return newLayer;
  }
  return "";
};

export const resetWMTSLayer = (layer: TileLayer<TileSource>) => {
  const source = layer.getSource();
  if (source instanceof WMTS) {
    const config = source.get("config");
    const newSource = new WMTS({
      ...config,
      layer: config.layer as string,
    });
    newSource.set("config", config);
    layer.setSource(newSource);
    layer.setVisible(false);
  }
};

//nibcache kartlaget har et eget endepunkt for hver projeksjon og er derfor ikke med her da den håndteres separat
type WMTSLayers = "topo" | "toporaster" | "topograatone";

type WMTSLayerToCapabilities = Record<WMTSLayers, string>;
const capabilitiesMap: WMTSLayerToCapabilities = {
  topo: "https://cache.kartverket.no/capabilities/topo/WMTSCapabilities.xml?request=GetCapabilities",
  toporaster: "https://cache.kartverket.no/capabilities/toporaster/WMTSCapabilities.xml?request=GetCapabilities",
  topograatone: "https://cache.kartverket.no/capabilities/topograatone/WMTSCapabilities.xml?request=GetCapabilities",
};

const nibcacheMetadataMap: Record<EpsgCode, { capabilities: string; url: string; identifierKey: string }> = {
  "EPSG:25833": {
    capabilities:
      "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2",
    identifierKey: "UTM33_EUREF89",
  },
  "EPSG:3857": {
    capabilities:
      "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_web_mercator_wmts_v2",
    identifierKey: "web_mercator",
  },

  "EPSG:25832": {
    capabilities:
      "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2",
    identifierKey: "UTM32_EUREF89",
  },

  "EPSG:25835": {
    capabilities:
      "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm35_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
    url: "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm35_wmts_v2",
    identifierKey: "UTM35_EUREF89",
  },
};

export const setWMTSProjection = async (layer: TileLayer<WMTS>, projectionEpsgCode: EpsgCode) => {
  const source = layer.getSource();
  if (source != null) {
    const config = source.get("config") as WMTSConfig;
    const isNibcacheLayer = config.layer.startsWith("Nibcache");
    // Nibcache lagene sin id varierer pga. at de har unike endepunkter for hver projeksjon, så vi kan ikke bare bruke samme mellom hver projeksjon
    const layerId = isNibcacheLayer
      ? `Nibcache_${nibcacheMetadataMap[projectionEpsgCode].identifierKey}_v2`
      : config.layer;
    const parser = new WMTSCapabilities();

    // For nibcache er det et eget endepunkt for hver støttede projeksjon.
    // Hvis vi bytter til noe som den ikke støtter får vi undefined.
    const path = isNibcacheLayer
      ? nibcacheMetadataMap[projectionEpsgCode].capabilities
      : capabilitiesMap[layerId as WMTSLayers];

    if (path !== undefined) {
      const wmtsConfig = await fetch(path)
        .then((result) => result.text())
        .then((text) => {
          const parsedXML = parser.read(text);
          // Vi ønsker å få config for den projeksjon vi får inn
          return optionsFromCapabilities(parsedXML, {
            layer: layerId,
            ...(!isNibcacheLayer ? { projection: projectionEpsgCode } : {}),
          });
        });
      const newMatrixSet = wmtsConfig?.matrixSet;
      const newTileGrid = wmtsConfig?.tileGrid;
      if (newMatrixSet != null && newTileGrid != null) {
        const newConfig = {
          ...config,
          ...(isNibcacheLayer ? { url: nibcacheMetadataMap[projectionEpsgCode].url } : {}),
          matrixSet: newMatrixSet,
          tileGrid: newTileGrid,
          layer: layerId,
        };
        // lager ny source med info fra capabilities endepunkt
        const newSource = new WMTS(newConfig);
        newSource.set("config", newConfig);
        layer.setSource(newSource);
      }
    }
  }
};

export const setWMSProjection = (layer: TileLayer<TileWMS>, projectionEpsgCode: EpsgCode) => {
  const source = layer.getSource();
  if (source instanceof TileWMS) {
    source.updateParams({ CRS: projectionEpsgCode });
  }
};

export const transformVectorLayerFeaturesToProjection = (
  layer: VectorLayer<VectorSource>,
  projectionEpsgCode: EpsgCode,
) => {
  const source = layer.getSource();
  if (source != null) {
    source?.getFeatures().forEach((feature) => {
      transformFeatureToProjection(feature, projectionEpsgCode);
    });
  }
};

export const transformFeatureToProjection = (feature: Feature<Geometry>, projectionEpsgCode: EpsgCode) => {
  const geometry = feature.getGeometry();
  const currentFeatureProperties = feature.getProperties() as FeatureProperties;
  const currentFeatureProjectionSRID = currentFeatureProperties.srid;
  const currentFeatureProjectionEPSGCode = getEPSGCodeFromSRID(currentFeatureProjectionSRID);
  if (geometry && !(currentFeatureProjectionEPSGCode === projectionEpsgCode)) {
    geometry.transform(currentFeatureProjectionEPSGCode, projectionEpsgCode);
    const newProperties: FeatureProperties = {
      ...currentFeatureProperties,
      srid: getSRIDFromEPSGCode(projectionEpsgCode),
    };
    feature.setProperties({
      ...newProperties,
    });
  }
};

const getSRIDFromEPSGCode = (epsgCode: EpsgCode) => {
  return Number(epsgCode.replace("EPSG:", ""));
};

const getEPSGCodeFromSRID = (srid: number): EpsgCode => {
  return `EPSG:${srid.toString()}`;
};
