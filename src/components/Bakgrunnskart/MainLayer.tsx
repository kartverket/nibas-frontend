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
};

const MainLayer = ({ layerId, index, canDrag = true }: Props) => {
  const layer = bakgrunnskartLayers[layerId];
  const { mappedLayers, moveLayer, toggleLayerVisibility, visibleLayers } =
    useBakgrunnskart();

  const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);

  if (!mappedLayer) return null;

  if (isWMSLayer(layer)) {
    return (
      <MainBackgroundLayer
        mappedLayer={mappedLayer}
        visible={visibleLayers[layerId]}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
      />
    );
  }

  if (isWMTSLayer(layer)) {
    return (
      <WMTSBackgroundLayer
        mappedLayer={mappedLayer}
        visible={visibleLayers[layerId]}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
      />
    );
  }

  if (isVectorLayer(layer)) {
    return (
      <WFSBackgroundLayer
        mappedLayer={mappedLayer}
        visible={visibleLayers[layerId]}
        toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
        index={index}
        moveLayer={canDrag ? moveLayer : undefined}
      />
    );
  }

  return null;
};

export default MainLayer;
