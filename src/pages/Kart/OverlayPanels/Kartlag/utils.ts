import TileLayer from "ol/layer/Tile";
import TileSource from "ol/source/Tile";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";

const removeLayer = (layers: string, layerId: string) => {
  const commaRegex = new RegExp(`(,?)(${layerId})(,?)`, "i");
  const matches = commaRegex.exec(layers);
  if (!matches) return layers;

  const prefixComma = matches.at(1);
  const trailingComma = matches.at(3);
  let replaceString = "";

  if (trailingComma) {
    // komma på slutten, potensielt på starten i tillegg men spiller ingen rolle
    replaceString = `${layerId},`;
  } else if (prefixComma) {
    // bare komma på starten
    replaceString = `,${layerId}`;
  } else {
    // ikke noe komma
    replaceString = `${layerId}`;
  }

  return layers.replace(replaceString, "");
};

export const toggleWMSLayer = (layer: TileLayer<TileSource>, willBeVisible: boolean, layerId: string) => {
  const source = layer.getSource();
  if (source instanceof TileWMS) {
    const layers = source.getParams().LAYERS as string;

    if (willBeVisible) {
      layer.setVisible(true);
      source.updateParams({ LAYERS: layers ? `${layers},${layerId}` : layerId });
    } else {
      const newLayers = removeLayer(layers, layerId);
      if (!newLayers) layer.setVisible(false);
      source.updateParams({ LAYERS: newLayers });
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

export const toggleWMTSLayer = (layer: TileLayer<TileSource>, willBeVisible: boolean, newLayerId?: string) => {
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
