import { bakgrunnskartLayers } from "hooks/layers/constants";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { MappedLayer } from "utils/getLayersFromWMS";
import { getMatWFSFeatures } from "utils/getMatrikkelWfsFeatures";
import { getLayerById, isWMTSLayer } from "utils/map/layers";
import { addFeaturesToSource } from "utils/map/source";

const getLayersStringToReplace = (
  layersInParams: string,
  mappedLayerName: string
) => {
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

export const toggleWMSLayer = (
  mappedLayer: MappedLayer,
  isVisible: boolean
) => {
  const source = bakgrunnskartLayers[
    mappedLayer.sourceId
  ].getSource() as TileWMS;
  const layersInParams = source.getParams().LAYERS as string;
  const mappedLayerId = mappedLayer.id;

  if (!mappedLayerId) return;

  let newParamsLayerString = "";

  if (isVisible) {
    const replaceString = getLayersStringToReplace(
      layersInParams,
      mappedLayerId
    );

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
  // hent originale sourcen med config
  // lag ny source basert på options med det nye laget
  const layer = getLayerById(mappedLayer.sourceId);
  if (isWMTSLayer(layer)) {
    const source = layer.getSource();
    if (source) {
      const newSource = new WMTS({
        ...source.get("config"),
        layer: mappedLayer.id,
      });
      newSource.set("config", source.get("config"));
      layer.setSource(newSource);
    }
  }
};

export const toggleWFSLayer = async () => {
  const features = await getMatWFSFeatures();
  if (!features) return null;
  const source = getLayerById("matrikkelenWfs").getSource();
  if (source) {
    source.clear();
  }
  addFeaturesToSource("matrikkelenWfs", features);
};
