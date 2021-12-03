import { useEffect, useState } from "react";
import LayerAccordion from "./LayerAccordion";
import SubLayer from "./SubLayer";
import { SyncSourceId } from "hooks/sources/types";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";

type Props = {
  mappedLayer: MappedLayer;
  mainLayerSourceId: SyncSourceId;
  mainLayerName: string;
  toggleMainLayer: (mappedLayer: MainMappedLayer) => void;
  isMainLayerVisible: (mappedLayer: MainMappedLayer) => boolean;
};

const MainLayer = ({
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
    <LayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
      visible={visible}
      onVisibilityClick={onVisibilityClick}
    >
      <>
        {mappedLayer.layers.map((layer) => (
          <SubLayer
            key={layer.title}
            mappedLayer={layer}
            mainLayerSourceId={mainLayerSourceId}
            mainLayerName={mainLayerName}
            indent={1}
          />
        ))}
      </>
    </LayerAccordion>
  );
};

export default MainLayer;
