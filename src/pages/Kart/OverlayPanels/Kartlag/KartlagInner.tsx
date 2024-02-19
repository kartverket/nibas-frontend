import { Checkbox } from "@kvib/react";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { styled } from "styled-components";
import { MappedLayer } from "utils/getLayersFromWMS";
import { isWMSLayer, isWMTSLayer } from "utils/map/layers";
import { toggleWMSLayer, toggleWMTSLayer } from "./utils";
import { kartlagLayers } from "hooks/layers/constants";

type Props = {
  mappedLayer: MappedLayer;
  isMainLayer?: boolean;
};

const KartlagInner = ({ mappedLayer, isMainLayer }: Props) => {
  const layer = kartlagLayers[mappedLayer.sourceId];
  const { layerIsVisible, subLayerIsVisible, toggleLayerVisibility } = useKartlag();

  const isVisible = isMainLayer
    ? layerIsVisible(mappedLayer.sourceId)
    : subLayerIsVisible(mappedLayer.sourceId, mappedLayer.title);

  const handleToggle = () => {
    if (isWMSLayer(layer)) toggleWMSLayer(mappedLayer, isVisible);
    if (isWMTSLayer(layer)) toggleWMTSLayer(mappedLayer);

    if (isMainLayer) {
      toggleLayerVisibility(mappedLayer.sourceId);
    } else {
      toggleLayerVisibility(mappedLayer.sourceId, mappedLayer.title, isWMTSLayer(layer));
    }
  };

  return (
    <Container>
      <Checkbox isChecked={isVisible} onChange={handleToggle}>
        {mappedLayer.title}
      </Checkbox>
    </Container>
  );
};

const Container = styled.div`
  padding: 16px;
  background: var(--kvib-colors-chakra-body-bg);
  border-radius: 8px;
`;

export default KartlagInner;
