import { useEffect, useState } from "react";
import WMTS from "ol/source/WMTS";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import WMTSSubLayer from "./WMTSSubLayer";
import { BakgrunnskartId } from "hooks/layers/types";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import { MainMappedLayer } from "utils/getLayersFromWMS";

const getActiveSubLayer = (sourceId: BakgrunnskartId) => {
  const source = bakgrunnskartSources[sourceId] as WMTS;
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
  const [visibleSubLayer, setVisibleSubLayer] = useState("");

  useEffect(() => {
    const activeSubLayer = getActiveSubLayer(mappedLayer.sourceId);

    setVisibleSubLayer(activeSubLayer);
  }, [mappedLayer.sourceId]);

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
            activeSubLayer={visibleSubLayer}
            updateActiveSubLayer={() => {
              const activeSubLayer = getActiveSubLayer(mappedLayer.sourceId);

              setVisibleSubLayer(activeSubLayer);
            }}
          />
        ))}
      </>
    </BackgroundLayerAccordion>
  );
};

export default WMTSBackgroundLayer;
