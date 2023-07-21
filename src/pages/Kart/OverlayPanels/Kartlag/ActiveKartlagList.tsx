import styled from "styled-components";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  ButtonGroup,
  Divider,
  Heading,
  IconButton,
} from "@kvib/react";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import Icon from "components/Icon/Icon";
import ActiveKartlagOpacity from "./ActiveKartlagOpacity";
import { BakgrunnskartId } from "hooks/layers/types";
import React from "react";

const ActiveKartlagList = () => {
  // TODO: refaktorer navn på kontekst til å være kartlag?
  const { mappedLayers, visibleLayers, toggleLayerVisibility } =
    useBakgrunnskart();

  // TODO: drag-and-drop

  const layerTitle = (layerId: BakgrunnskartId) =>
    mappedLayers.find((ml) => ml.sourceId === layerId)?.title;

  return (
    <>
      {visibleLayers.length > 0 ? (
        visibleLayers.map((layer) => (
          <ActiveKartlag key={layer.mainLayer}>
            <TitleContainer>
              <Heading as="h4" size="sm">
                {layerTitle(layer.mainLayer)}
              </Heading>
              <Buttons>
                <ActiveKartlagOpacity layerId={layer.mainLayer} />
                <IconButton
                  aria-label={`Fjern ${layer.mainLayer}`}
                  variant="ghost"
                  icon={<Icon icon="close" />}
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
                    icon={<Icon icon="close" />}
                    onClick={() =>
                      toggleLayerVisibility(layer.mainLayer, subLayer)
                    }
                  />
                </ActiveSublag>
              </React.Fragment>
            ))}
          </ActiveKartlag>
        ))
      ) : (
        <Alert>
          <AlertIcon />
          <AlertTitle>TODO: Det er ingen aktive kartlag</AlertTitle>
        </Alert>
      )}
    </>
  );
};

const ActiveKartlag = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border-width: 1px;
  border-radius: 8px;
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

export default ActiveKartlagList;
