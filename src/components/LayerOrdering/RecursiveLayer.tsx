import TileWMS from "ol/source/TileWMS";
import { MappedLayer } from "utils/getLayersFromWMS";
import { SyncSourceId } from "hooks/sources/types";
import { syncSources } from "hooks/sources/syncSources";

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

type Props = {
  mappedLayer: MappedLayer;
  indent: number;
  mainLayerSourceId: SyncSourceId;
};

const RecursiveLayer = ({ mappedLayer, indent, mainLayerSourceId }: Props) => {
  const isSubLayerVisible = () => {
    const source = syncSources[mainLayerSourceId] as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;

    if (!mappedLayer.name) return false;

    return layersInParams.includes(mappedLayer.name);
  };

  const onChange = () => {
    const source = syncSources[mainLayerSourceId] as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;
    const mappedLayerName = mappedLayer.name;

    if (!mappedLayerName) return;

    if (isSubLayerVisible()) {
      const replaceString = getLayersStringToReplace(
        layersInParams,
        mappedLayerName
      );

      if (!replaceString) return;

      const layersReplacedString = layersInParams.replace(replaceString, "");
      source.updateParams({ LAYERS: layersReplacedString });
    } else {
      let newLayers = "";

      if (!layersInParams) {
        newLayers = `${mappedLayerName}`;
      } else {
        newLayers = `${layersInParams},${mappedLayerName}`;
      }

      source.updateParams({ LAYERS: newLayers });
    }
  };

  return (
    <div style={{ marginLeft: indent * 8 }}>
      <input
        type="checkbox"
        onChange={onChange}
        defaultChecked={isSubLayerVisible()}
      />
      <span>{mappedLayer.title}</span>
      {mappedLayer.layers.map((subMappedLayer, i) => (
        <RecursiveLayer
          key={`${mappedLayer.title}-${i}`}
          mappedLayer={subMappedLayer}
          indent={indent + 1}
          mainLayerSourceId={mainLayerSourceId}
        />
      ))}
    </div>
  );
};

export default RecursiveLayer;
