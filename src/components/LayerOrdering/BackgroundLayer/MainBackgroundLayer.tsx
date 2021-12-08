import { useEffect, useState } from "react";
import BackgroundLayerAccordion from "./BackgroundLayerAccordion";
import SubBackgroundLayer from "./SubBackgroundLayer";
import { SyncSourceId } from "hooks/sources/types";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MappedLayer;
  mainLayerSourceId: SyncSourceId;
  mainLayerName: string;
  toggleMainLayer: (mappedLayer: MainMappedLayer) => void;
  isMainLayerVisible: (mappedLayer: MainMappedLayer) => boolean;
};

const MainBackgroundLayer = ({
  mappedLayer,
  mainLayerSourceId,
  mainLayerName,
  toggleMainLayer,
  isMainLayerVisible,
}: Props) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(isMainLayerVisible(mappedLayer as MainMappedLayer));
  }, [isMainLayerVisible, mappedLayer]);

  const onVisibilityClick = () => {
    toggleMainLayer(mappedLayer as MainMappedLayer);

    setVisible(!visible);
  };

  return (
    <BackgroundLayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
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
            indent={1}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default MainBackgroundLayer;
