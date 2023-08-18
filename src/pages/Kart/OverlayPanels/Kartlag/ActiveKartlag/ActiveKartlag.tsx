import React from "react";
import { styled } from "styled-components";
import { useDragAndDrop } from "../utils";
import { Heading, IconButton, Divider, ButtonGroup, Icon } from "@kvib/react";
import ActiveKartlagOpacity from "./ActiveKartlagOpacity";
import { VisibleLayer } from "contexts/KartlagContext/useVisibleLayers";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";

type Props = {
  index: number;
  layer: VisibleLayer;
};

const ActiveKartlag = ({ layer, index }: Props) => {
  const { mappedLayers, moveLayer, toggleLayerVisibility } = useKartlag();

  const mappedLayer = mappedLayers.find(
    (ml) => ml.sourceId === layer.mainLayer
  );

  const ref = useDragAndDrop(index, mappedLayer, moveLayer);

  return (
    <Container ref={ref}>
      <DragIcon icon="format_line_spacing" />
      <Card>
        <TitleContainer>
          <Heading as="h4" size="sm">
            {mappedLayer?.title}
          </Heading>
          <Buttons>
            <ActiveKartlagOpacity layerId={layer.mainLayer} />
            <IconButton
              aria-label={`Fjern ${layer.mainLayer}`}
              variant="ghost"
              icon="close"
              onClick={() => toggleLayerVisibility(layer.mainLayer)}
            />
          </Buttons>
        </TitleContainer>
        {layer.subLayers.map((subLayer) => (
          <React.Fragment key={subLayer}>
            <Divider />
            <ActiveSublag>
              <span>{subLayer}</span>
              <IconButton
                aria-label={`Fjern ${subLayer}`}
                variant="ghost"
                icon="close"
                onClick={() => toggleLayerVisibility(layer.mainLayer, subLayer)}
              />
            </ActiveSublag>
          </React.Fragment>
        ))}
      </Card>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const DragIcon = styled(Icon)`
  cursor: move;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border-width: 1px;
  border-radius: 8px;

  .material-symbols-rounded {
    font-size: 24px;
  }
`;

const ActiveSublag = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Buttons = styled(ButtonGroup)`
  margin-left: auto;
`;

export default ActiveKartlag;
