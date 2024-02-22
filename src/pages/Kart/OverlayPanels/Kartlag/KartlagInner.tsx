import { Checkbox } from "@kvib/react";
import { MappedLayer, useKartlag } from "contexts/KartlagContext/KartlagContext";
import { styled } from "styled-components";
import { isWMSLayer, isWMTSLayer } from "utils/map/layers";
import { toggleWMSLayer, toggleWMTSLayer } from "./utils";
import { kartlagLayers } from "hooks/layers/constants";

type Props = {
  mappedLayer: MappedLayer;
  isMainLayer?: boolean;
};

// TODO: denne må kanskje også ha en opacity-slider hvis det er et mainlayer?
const KartlagInner = ({ mappedLayer, isMainLayer }: Props) => {
  const layer = kartlagLayers[mappedLayer.sourceId];
  const { toggleLayerVisibility } = useKartlag();

  const handleToggle = () => {
    if (isWMSLayer(layer)) toggleWMSLayer(mappedLayer, mappedLayer.isVisible);
    if (isWMTSLayer(layer)) toggleWMTSLayer(mappedLayer);

    if (isMainLayer) {
      toggleLayerVisibility(mappedLayer.sourceId);
    } else {
      toggleLayerVisibility(mappedLayer.sourceId, mappedLayer.title, isWMTSLayer(layer));
    }
  };

  return (
    <Container>
      <Checkbox isChecked={mappedLayer.isVisible} onChange={handleToggle}>
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
