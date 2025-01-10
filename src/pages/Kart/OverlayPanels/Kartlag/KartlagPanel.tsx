import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, SidePanel } from "../Panel";
import { styled } from "styled-components";
import Kartlag from "./Kartlag";
import { useKartlag } from "contexts/KartlagContext/KartlagContext";
import { Spinner, Center } from "@kvib/react";

const KartlagPanel = () => {
  const { mappedLayers } = useKartlag();
  const { closeOverlayPanel } = useOverlayPanel();

  return (
    <SidePanel>
      <PanelHeader onClose={closeOverlayPanel}>Kartlag</PanelHeader>
      <KartlagList>
        {mappedLayers.length > 0 ? (
          mappedLayers.map((mappedLayer, index) => (
            <Kartlag
              key={mappedLayer.sourceId}
              mappedLayer={mappedLayer}
              index={index}
              maxIndex={mappedLayers.length - 1}
            />
          ))
        ) : (
          <Center>
            <Spinner thickness="2px" emptyColor="gray.200" color="blue.500" size="xl" />
          </Center>
        )}
      </KartlagList>
    </SidePanel>
  );
};

const KartlagList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
`;

export default KartlagPanel;
