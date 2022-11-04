import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MainMappedLayer;
  index: number;
  toggleLayerVisibility: () => void;
  toggleSubLayerVisibility: (layerId: string) => void;
  visible: boolean;
  moveLayer?: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
  isAktiveKartlag?: boolean;
  visibleSubLayers: string[];
};

const MainBackgroundLayer = ({
  mappedLayer,
  visible,
  toggleLayerVisibility,
  toggleSubLayerVisibility,
  index,
  moveLayer,
  isAktiveKartlag,
  visibleSubLayers,
}: Props) => {
  const ref = useBackgroundLayerDND(index, mappedLayer, moveLayer);

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
      visible={visible}
      onVisibilityClick={toggleLayerVisibility}
      ref={moveLayer ? ref : null}
      isMainLayer
      isAktiveKartlag={isAktiveKartlag}
    >
      <>
        {mappedLayer.layers
          .filter((layer) =>
            isAktiveKartlag ? visibleSubLayers.includes(layer.title) : true
          )
          .map((layer) => (
            <SubBackgroundLayer
              key={layer.title}
              mappedLayer={layer}
              mainLayerSourceId={mappedLayer.sourceId}
              mainLayerName={mappedLayer.id ?? ""}
              indent={1}
              toggleSubLayerVisibility={toggleSubLayerVisibility}
              isAktiveKartlag={isAktiveKartlag}
            />
          ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default MainBackgroundLayer;
