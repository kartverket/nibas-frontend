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
export const toggleWMSLayer = (mappedLayer: MappedLayer, isVisible: boolean) => {
  const source = kartlagLayers[mappedLayer.sourceId].getSource() as TileWMS;
  const layersInParams = source.getParams().LAYERS as string;
  const mappedLayerId = mappedLayer.id;

  if (!mappedLayerId) return;

  let newParamsLayerString = "";

  if (isVisible) {
    const replaceString = getLayersStringToReplace(layersInParams, mappedLayerId);

    if (!replaceString) return;

    const layersReplacedString = layersInParams.replace(replaceString, "");

    // hvis param layer ville vært tom, gjør den til hovedlaget igjen
    if (!layersReplacedString) {
      newParamsLayerString = mappedLayer.sourceId;
    } else {
      newParamsLayerString = layersReplacedString;
    }
  } else {
    let newLayers = "";

    if (!layersInParams || mappedLayer.sourceId === layersInParams) {
      newLayers = `${mappedLayerId}`;
    } else {
      newLayers = `${layersInParams},${mappedLayerId}`;
    }

    newParamsLayerString = newLayers;
  }

  source.updateParams({ LAYERS: newParamsLayerString });
};

export const toggleWMTSLayer = (mappedLayer: MappedLayer) => {
  const layer = getLayerById(mappedLayer.sourceId);
  if (isWMTSLayer(layer)) {
    const source = layer.getSource();
    if (source) {
      // OpenLayers lar deg ikke sette layer for WMTS-lag, så vi må bytte ut hele sourcen med ny layer-verdi
      const config = source.get("config");
      const newSource = new WMTS({
        ...config,
        layer: mappedLayer.id,
      });
      newSource.set("config", config);
      layer.setSource(newSource);
    }
  }
};
