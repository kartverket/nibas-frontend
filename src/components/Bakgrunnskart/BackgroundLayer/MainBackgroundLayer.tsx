import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";

type Props = {
  mappedLayer: MainMappedLayer;
  index: number;
  toggleLayerVisibility: () => void;
  visible: boolean;
  moveLayer?: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
  isAktiveKartlag?: boolean;
};

const MainBackgroundLayer = ({
  mappedLayer,
  visible,
  toggleLayerVisibility,
  index,
  moveLayer,
  isAktiveKartlag,
}: Props) => {
  const ref = useBackgroundLayerDND(index, mappedLayer, moveLayer);
  const { recursiveIsVisible } = useBakgrunnskart();

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
            isAktiveKartlag
              ? recursiveIsVisible(mappedLayer.sourceId, layer)
              : true
          )
          .map((layer) => (
            <SubBackgroundLayer
              key={layer.title}
              mappedLayer={layer}
              mainLayerSourceId={mappedLayer.sourceId}
              mainLayerName={mappedLayer.id ?? ""}
              indent={1}
              isAktiveKartlag={isAktiveKartlag}
            />
          ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default MainBackgroundLayer;
