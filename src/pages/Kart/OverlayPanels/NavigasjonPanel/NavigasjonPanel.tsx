import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { keyframes, styled } from "styled-components";
import { map } from "../../constants";
import { AbsolutePanel, PanelProps } from "../Panel";
import { KoordinaterSearch } from "./KoordinaterSearch";
import { InndelingSearch } from "./InndelingSearch";

export type NavigasjonProps = {
  centerOnCoordinate: (north: number | null, east: number | null) => void;
};

const NavigasjonPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();

  const centerOnCoordinate = (north: number | null, east: number | null) => {
    if (north !== null && east !== null) {
      const view = map.getView();
      view.animate({ duration: 250, center: [east, north] });
      closeOverlayModal();
    }
  };

  return (
    <Container $isOpen={isOpen} className={className}>
      <Tabs size="md">
        <TabList>
          <Tab>Gå til inndeling</Tab>
          <Tab>Gå til koordinater</Tab>
        </TabList>
        <TabPanels>
          <StyledTabPanel>
            <InndelingSearch centerOnCoordinate={centerOnCoordinate} />
          </StyledTabPanel>
          <StyledTabPanel>
            <KoordinaterSearch centerOnCoordinate={centerOnCoordinate} />
          </StyledTabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -10%);
  }
  to {
    opacity: 1;
    transform: translateX(-50%);
  }
`;

const Container = styled(AbsolutePanel)`
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  max-width: unset;
  width: fit-content;
  padding: 24px;
  animation: ${fadeIn} 0.25s ease-in-out;
  overflow: visible;
`;

const StyledTabPanel = styled(TabPanel)`
  padding-left: 0;
  padding-right: 0;
`;

export default NavigasjonPanel;
