import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { VisibleLayers } from "hooks/layers/useVisibleLayers";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer } from "utils/map/layers";

type Props = {
  mappedLayer: MainMappedLayer;
  mainLayerSourceId: BakgrunnskartId;
  mainLayerName: string;
  index: number;
  moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
  visibleLayers: VisibleLayers;
  toggleLayerVisibility: (layerId: BakgrunnskartId) => void;
};

const MainBackgroundLayer = ({
  mappedLayer,
  mainLayerSourceId,
  mainLayerName,
  visibleLayers,
  toggleLayerVisibility,
  index,
  moveLayer,
}: Props) => {
  const ref = useBackgroundLayerDND(index, moveLayer, mappedLayer);

  const onVisibilityClick = () => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return;

    toggleLayerVisibility(layerId);
  };

  const isVisible = () => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return false;

    return visibleLayers[layerId];
  };

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
      visible={isVisible()}
      onVisibilityClick={onVisibilityClick}
      ref={ref}
      isMainLayer
    >
      <>
        {mappedLayer.layers.map((layer) => (
          <SubBackgroundLayer
            key={layer.title}
            mappedLayer={layer}
            mainLayerSourceId={mainLayerSourceId}
            mainLayerName={mainLayerName}
            indent={1}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default MainBackgroundLayer;
