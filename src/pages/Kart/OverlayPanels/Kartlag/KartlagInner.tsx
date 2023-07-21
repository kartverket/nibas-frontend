import { IconButton } from "@kvib/react";
import Icon from "components/Icon";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import styled from "styled-components";
import { MappedLayer } from "utils/getLayersFromWMS";
import { isVectorLayer, isWMSLayer, isWMTSLayer } from "utils/map/layers";
import { toggleWMSLayer, toggleWMTSLayer, toggleWFSLayer } from "./utils";
import { bakgrunnskartLayers } from "hooks/layers/constants";

type Props = {
  mappedLayer: MappedLayer;
  isMainLayer?: boolean;
};

const KartlagInner = ({ mappedLayer, isMainLayer }: Props) => {
  const layer = bakgrunnskartLayers[mappedLayer.sourceId];
  const { layerIsVisible, subLayerIsVisible, toggleLayerVisibility } =
    useBakgrunnskart();

  const isVisible = isMainLayer
    ? layerIsVisible(mappedLayer.sourceId)
    : subLayerIsVisible(mappedLayer.sourceId, mappedLayer.title);

  const handleToggle = () => {
    if (isWMSLayer(layer)) {
      toggleWMSLayer(mappedLayer, isVisible);
    }

    if (isWMTSLayer(layer)) {
      toggleWMTSLayer(mappedLayer);
    }

    // TODO: dobbeltsjekk litt logikk her, hvorfor er den sånn her? var det alltid sånn at den bare fungerte en gang?
    if (isVectorLayer(layer) && !isVisible) {
      toggleWFSLayer();
    }

    if (isMainLayer) {
      toggleLayerVisibility(mappedLayer.sourceId);
    } else {
      toggleLayerVisibility(mappedLayer.sourceId, mappedLayer.title);
    }
  };

  return (
    <Container>
      <span>{mappedLayer.title}</span>
      <IconButton
        colorScheme="gray"
        variant="outline"
        icon={<Icon icon={isVisible ? "visibility_off" : "visibility"} />}
        aria-label={
          isVisible ? `Fjern ${mappedLayer.title}` : `Vis ${mappedLayer.title}`
        }
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
