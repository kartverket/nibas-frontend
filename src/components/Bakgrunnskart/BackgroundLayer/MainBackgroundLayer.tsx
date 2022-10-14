import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { BakgrunnskartProvider } from "contexts/BakgrunnskartContext";

type Props = {
  mappedLayer: MainMappedLayer;
  index: number;
  toggleLayerVisibility: () => void;
  visible: boolean;
  moveLayer?: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
};

const MainBackgroundLayer = ({
  mappedLayer,
  visible,
  toggleLayerVisibility,
  index,
  moveLayer,
}: Props) => {
  const ref = useBackgroundLayerDND(index, mappedLayer, moveLayer);

  return (
    <BakgrunnskartProvider>
      <BackgroundLayerAccordion
        key={mappedLayer.title}
        mappedLayer={mappedLayer}
        indent={0}
        visible={visible}
        onVisibilityClick={toggleLayerVisibility}
        ref={moveLayer ? ref : null}
        isMainLayer
      >
        <>
          {mappedLayer.layers.map((layer) => (
            <SubBackgroundLayer
              key={layer.title}
              mappedLayer={layer}
              mainLayerSourceId={mappedLayer.sourceId}
              mainLayerName={mappedLayer.id ?? ""}
              indent={1}
            />
          ))}
        </>
      </BackgroundLayerAccordion>
    </BakgrunnskartProvider>
  );
};

export default MainBackgroundLayer;
