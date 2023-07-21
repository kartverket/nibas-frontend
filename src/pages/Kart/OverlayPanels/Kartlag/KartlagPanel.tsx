import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { PanelHeader, PanelProps, SidePanel } from "../Panel";
import styled from "styled-components";
import { Divider, Heading } from "@kvib/react";
import Kartlag from "./Kartlag";
import ActiveKartlagList from "./ActiveKartlagList";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";

const KartlagPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayPanel } = useOverlayPanel();

  return (
    <SidePanel isOpen={isOpen} className={className}>
      <PanelHeader onClose={closeOverlayPanel}>Kartlag</PanelHeader>
      <Section>
        <ActiveKartlagList />
      </Section>
      <Divider />
      <Section>
        <Heading as="h3" size="md">
          Legg til et nytt kartlag
        </Heading>
        {Object.keys(bakgrunnskartLayers).map((layerId) => (
          <Kartlag key={layerId} layerId={layerId as BakgrunnskartId} />
        ))}
      </Section>
    </SidePanel>
  );
};

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
`;

export default KartlagPanel;
