import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer } from "utils/map/layers";

type Props = {
  mappedLayer: MainMappedLayer;
  mainLayerSourceId: BakgrunnskartId;
  mainLayerName: string;
  index: number;
  moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
  toggleLayerVisibility: () => void;
  visible: boolean;
};

const MainBackgroundLayer = ({
  mappedLayer,
  mainLayerSourceId,
  mainLayerName,
  visible,
  toggleLayerVisibility,
  index,
  moveLayer,
}: Props) => {
  const ref = useBackgroundLayerDND(index, moveLayer, mappedLayer);

  const onVisibilityClick = () => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return;

    toggleLayerVisibility();
  };

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
      visible={visible}
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
