import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import WFSBackgroundLayer from "./WFS/WFSBackgroundLayer";
import WMTSBackgroundLayer from "./WMTS/WMTSBackgroundLayer";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import { isVectorLayer, isWMSLayer, isWMTSLayer } from "utils/map/layers";

type Props = {
  layerId: BakgrunnskartId;
  index: number;
  canDrag?: boolean;
  isAktiveKartlag?: boolean;
};

const MainLayer = ({ layerId, index, canDrag, isAktiveKartlag }: Props) => {
  const layer = bakgrunnskartLayers[layerId];
  const { mappedLayers, moveLayer, toggleLayerVisibility, layerIsVisible } =
    useBakgrunnskart();

  const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);
  if (!mappedLayer) return null;

  if (isWMSLayer(layer)) {
    return (
      <MainBackgroundLayer
        mappedLayer={mappedLayer}
        visible={layerIsVisible(layerId)}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
        isAktiveKartlag={isAktiveKartlag}
      />
    );
  }

  if (isWMTSLayer(layer)) {
    return (
      <WMTSBackgroundLayer
        mappedLayer={mappedLayer}
        visible={layerIsVisible(layerId)}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
        isAktiveKartlag={isAktiveKartlag}
      />
    );
  }

  if (isVectorLayer(layer)) {
    return (
      <WFSBackgroundLayer
        mappedLayer={mappedLayer}
        visible={layerIsVisible(layerId)}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
        isAktiveKartlag={isAktiveKartlag}
      />
    );
  }

  return null;
};

export default MainLayer;
