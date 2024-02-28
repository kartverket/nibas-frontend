import { MappedLayer } from "contexts/KartlagContext/KartlagContext";
import { kartlagLayers } from "hooks/layers/constants";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { getLayerById, isWMTSLayer } from "utils/map/layers";

const getLayersStringToReplace = (layersInParams: string, mappedLayerName: string) => {
  const commaRegex = new RegExp(`(,{0,1})(${mappedLayerName})(,{0,1})`, "i");
  const match = commaRegex.exec(layersInParams);

  if (!match) return;

  const prefixComma = match[1];
  const trailingComma = match[3];
  let replaceString = "";

  if (trailingComma) {
    // komma på slutten, potensielt på starten i tillegg men spiller ingen rolle
    replaceString = `${mappedLayerName},`;
  } else if (prefixComma && !trailingComma) {
    // bare komma på starten
    replaceString = `,${mappedLayerName}`;
  } else if (!prefixComma && !trailingComma) {
    // ikke noe komma
    replaceString = `${mappedLayerName}`;
  }

  return replaceString;
};

// TODO: opplever at laget henger igjen inntil man oppdaterer kartet, har vi en måte å cleare?
export const toggleWMSLayer = (mappedLayer: MappedLayer, willBeVisible: boolean) => {
  const layer = kartlagLayers[mappedLayer.sourceId];
  const source = layer.getSource() as TileWMS;
  const layersInParams = source.getParams().LAYERS as string;

  let newParamsLayerString = "";

  if (willBeVisible) {
    layer.setVisible(true);
    let newLayers = "";

    if (!layersInParams || mappedLayer.sourceId === layersInParams) {
      newLayers = `${mappedLayer.id}`;
    } else {
      newLayers = `${layersInParams},${mappedLayer.id}`;
    }

    newParamsLayerString = newLayers;
  } else {
    layer.setVisible(false);
    const replaceString = getLayersStringToReplace(layersInParams, mappedLayer.id);
    if (!replaceString) return;

    const layersReplacedString = layersInParams.replace(replaceString, "");

    // hvis param layer ville vært tom, gjør den til hovedlaget igjen
    if (!layersReplacedString) {
      newParamsLayerString = mappedLayer.sourceId;
    } else {
      newParamsLayerString = layersReplacedString;
    }
  }

  source.updateParams({ LAYERS: newParamsLayerString });
};

export const toggleWMTSLayer = (mappedLayer: MappedLayer, willBeVisible: boolean, useDefaultLayer: boolean) => {
  const layer = getLayerById(mappedLayer.sourceId);
  if (isWMTSLayer(layer)) {
    const source = layer.getSource();
    if (source) {
      // OpenLayers lar deg ikke sette layer for WMTS-lag, så vi må bytte ut hele sourcen med ny layer-verdi
      const config = source.get("config");
      const newLayer = useDefaultLayer ? (config.layer as string) : mappedLayer.id;
      const newSource = new WMTS({
        ...config,
        layer: newLayer,
      });
      newSource.set("config", config);
      layer.setSource(newSource);
      layer.setVisible(willBeVisible);
      return newLayer;
    }
  }
  return "";
};
