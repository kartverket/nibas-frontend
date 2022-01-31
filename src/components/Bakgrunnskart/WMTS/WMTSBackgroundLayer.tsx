import { useCallback, useEffect, useState } from "react";
import WMTS from "ol/source/WMTS";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import WMTSSubLayer from "./WMTSSubLayer";
import { BakgrunnskartId } from "hooks/layers/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { getLayerById } from "utils/map/layers";

const getActiveSubLayer = (sourceId: BakgrunnskartId) => {
  const layer = getLayerById(sourceId);
  const source = layer.getSource() as WMTS;

  return source.getLayer();
};

type Props = {
  mappedLayer: MainMappedLayer;
  visible: boolean;
  toggleLayerVisibility: () => void;
};

const WMTSBackgroundLayer = ({
  mappedLayer,
  visible,
  toggleLayerVisibility,
}: Props) => {
  // vi må manuelt oppdatere state når synlighet endres,
  // siden openlayers ikke rerendrer UIet vårt
  const [activeSubLayer, setActiveSubLayer] = useState("");

  const updateActiveSubLayer = useCallback(() => {
    const activeSubLayer = getActiveSubLayer(mappedLayer.sourceId);

    setActiveSubLayer(activeSubLayer);
  }, [mappedLayer.sourceId]);

  useEffect(() => {
    updateActiveSubLayer();
  }, [updateActiveSubLayer]);

  return (
    <BackgroundLayerAccordion
      isMainLayer
      indent={0}
      mappedLayer={mappedLayer}
      onVisibilityClick={toggleLayerVisibility}
      visible={visible}
    >
      <>
        {mappedLayer.layers.map((subLayer) => (
          <WMTSSubLayer
            key={subLayer.title}
            subLayer={subLayer}
            sourceId={mappedLayer.sourceId}
            activeSubLayer={activeSubLayer}
            updateActiveSubLayer={updateActiveSubLayer}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default WMTSBackgroundLayer;
