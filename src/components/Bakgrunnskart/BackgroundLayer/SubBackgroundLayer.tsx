import { useEffect, useState } from "react";
import TileWMS from "ol/source/TileWMS";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import { syncSources } from "hooks/sources/syncSources";
import { SyncSourceId } from "hooks/sources/types";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";

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
  mainLayerName: string;
  toggleMainLayer?: (mappedLayer: MainMappedLayer) => void;
  isMainLayerVisible?: (mappedLayer: MainMappedLayer) => boolean;
};

const SubBackgroundLayer = ({
  mappedLayer,
  indent,
  mainLayerSourceId,
  mainLayerName,
  toggleMainLayer,
  isMainLayerVisible,
}: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isSubLayerVisible = () => {
      const source = syncSources[mainLayerSourceId] as TileWMS;
      const layersInParams = source.getParams().LAYERS as string;

      if (!mappedLayer.name) return false;

      return layersInParams.includes(mappedLayer.name);
    };

    // hvis hovedlag, sjekk i funksjonen fra props om laget er synlig
    if (isMainLayerVisible) {
      setVisible(isMainLayerVisible(mappedLayer as MainMappedLayer));
    } else {
      setVisible(isSubLayerVisible());
    }
  }, [mainLayerSourceId, mappedLayer.name, isMainLayerVisible, mappedLayer]);

  const updateSourceParams = () => {
    const source = syncSources[mainLayerSourceId] as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;
    const mappedLayerName = mappedLayer.name;

    if (!mappedLayerName) return;

    let newParamsLayerString = "";

    if (visible) {
      const replaceString = getLayersStringToReplace(
        layersInParams,
        mappedLayerName
      );

      if (!replaceString) return;

      const layersReplacedString = layersInParams.replace(replaceString, "");

      // hvis param layer ville vært tom, gjør den til hovedlaget igjen
      if (!layersReplacedString) {
        newParamsLayerString = mainLayerName;
      } else {
        newParamsLayerString = layersReplacedString;
      }
    } else {
      let newLayers = "";

      if (!layersInParams || mainLayerName === layersInParams) {
        newLayers = `${mappedLayerName}`;
      } else {
        newLayers = `${layersInParams},${mappedLayerName}`;
      }

      newParamsLayerString = newLayers;
    }

    source.updateParams({ LAYERS: newParamsLayerString });
  };

  const onVisibilityClick = () => {
    // hvis dette er et hovedlag, skjul i hook i stedet for å endre params
    if (toggleMainLayer) {
      toggleMainLayer(mappedLayer as MainMappedLayer);
    } else {
      updateSourceParams();
    }

    setVisible(!visible);
  };

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={indent}
      visible={visible}
      onVisibilityClick={onVisibilityClick}
    >
      <>
        {mappedLayer.layers.map((layer) => (
          <SubBackgroundLayer
            key={layer.title}
            mappedLayer={layer}
            mainLayerSourceId={mainLayerSourceId}
            mainLayerName={mainLayerName}
            indent={indent + 1}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default SubBackgroundLayer;
