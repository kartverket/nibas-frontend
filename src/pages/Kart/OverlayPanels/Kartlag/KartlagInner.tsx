import { IconButton } from "@kvib/react";
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
      <span>{mappedLayer.title}</span>
      <IconButton
        variant="ghost"
        icon={isVisible ? "visibility" : "visibility_off"}
        aria-label={isVisible ? `Fjern ${mappedLayer.title}` : `Vis ${mappedLayer.title}`}
        onClick={handleToggle}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--kvib-colors-chakra-body-bg);
`;

export default KartlagInner;
