import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import useBackgroundLayerDND from "../BackgroundLayer/useBackgroundLayerDND";
import WMTSSubLayer from "./WMTSSubLayer";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";

type Props = {
  mappedLayer: MainMappedLayer;
  visible: boolean;
  toggleLayerVisibility: () => void;
  index: number;
  moveLayer?: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
  isAktiveKartlag?: boolean;
};

const WMTSBackgroundLayer = ({
  mappedLayer,
  visible,
  index,
  moveLayer,
  isAktiveKartlag,
}: Props) => {
  const { toggleLayerVisibility } = useBakgrunnskart();
  const ref = useBackgroundLayerDND(index, mappedLayer, moveLayer);

  const onVisibilityClick = () => {
    toggleLayerVisibility(mappedLayer.sourceId, mappedLayer.title);
  };

  return (
    <BackgroundLayerAccordion
      isMainLayer
      indent={0}
      mappedLayer={mappedLayer}
      onVisibilityClick={onVisibilityClick}
      visible={visible}
      ref={moveLayer ? ref : null}
      isAktiveKartlag={isAktiveKartlag}
    >
      <>
        {mappedLayer.layers.map((subLayer) => (
          <WMTSSubLayer
            key={subLayer.title}
            subLayer={subLayer}
            sourceId={mappedLayer.sourceId}
            isAktivtKartlag={isAktiveKartlag}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default WMTSBackgroundLayer;
