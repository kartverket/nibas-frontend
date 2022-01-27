import { useEffect, useState } from "react";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import useBackgroundLayerDND from "./useBackgroundLayerDND";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MainMappedLayer;
  mainLayerSourceId: BakgrunnskartId;
  mainLayerName: string;
  toggleMainLayer: (mappedLayer: MainMappedLayer) => void;
  isMainLayerVisible: (mappedLayer: MainMappedLayer) => boolean;
  index: number;
  moveLayer: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
};

const MainBackgroundLayer = ({
  mappedLayer,
  mainLayerSourceId,
  mainLayerName,
  toggleMainLayer,
  isMainLayerVisible,
  index,
  moveLayer,
}: Props) => {
  const [visible, setVisible] = useState(false);

  const ref = useBackgroundLayerDND(index, moveLayer, mappedLayer);

  useEffect(() => {
    setVisible(isMainLayerVisible(mappedLayer));
  }, [isMainLayerVisible, mappedLayer]);

  const onVisibilityClick = () => {
    toggleMainLayer(mappedLayer);

    setVisible(!visible);
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
