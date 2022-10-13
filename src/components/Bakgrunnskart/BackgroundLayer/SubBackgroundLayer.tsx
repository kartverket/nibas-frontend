import { useEffect, useState } from "react";
import TileWMS from "ol/source/TileWMS";
import { bakgrunnskartLayers } from "../../../hooks/layers/constants";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import { BakgrunnskartId } from "hooks/layers/types";
import { MappedLayer } from "utils/getLayersFromWMS";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";

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
  mainLayerSourceId: BakgrunnskartId;
  mainLayerName: string;
  isAktivtKartlag?: boolean;
};

const SubBackgroundLayer = ({
  mappedLayer,
  indent,
  mainLayerSourceId,
  mainLayerName,
  isAktivtKartlag,
}: Props) => {
  const [visible, setVisible] = useState(false);

  const { toggleLayerVisibility, visibleLayers } = useBakgrunnskart();

  useEffect(() => {
    const isSubLayerVisible = () => {
      const source = bakgrunnskartLayers[
        mainLayerSourceId
      ].getSource() as TileWMS;
      const layersInParams = source.getParams().LAYERS as string;

      if (!mappedLayer.id) return false;

      return layersInParams.includes(mappedLayer.id);
    };

    setVisible(isSubLayerVisible());
  }, [mainLayerSourceId, mappedLayer.id, mappedLayer]);

  const updateSourceParams = () => {
    const source = bakgrunnskartLayers[
      mainLayerSourceId
    ].getSource() as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;
    const mappedLayerId = mappedLayer.id;

    if (!mappedLayerId) return;

    let newParamsLayerString = "";

    if (visible) {
      const replaceString = getLayersStringToReplace(
        layersInParams,
        mappedLayerId
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
        newLayers = `${mappedLayerId}`;
      } else {
        newLayers = `${layersInParams},${mappedLayerId}`;
      }

      newParamsLayerString = newLayers;
    }

    source.updateParams({ LAYERS: newParamsLayerString });
  };

  const onVisibilityClick = () => {
    updateSourceParams();
    const source = bakgrunnskartLayers[
      mainLayerSourceId
    ].getSource() as TileWMS;
    const layersInParams = source.getParams().LAYERS as string;

    const isMainLayerVisible = visibleLayers[mainLayerSourceId];
    console.log(layersInParams);
    if (layersInParams && !isMainLayerVisible) {
      toggleLayerVisibility(mainLayerSourceId);
    } else if (layersInParams === mainLayerName && isMainLayerVisible) {
      toggleLayerVisibility(mainLayerSourceId);
    }
    setVisible(!visible);
  };

  if (!visible && isAktivtKartlag) {
    return <div />;
  }

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
