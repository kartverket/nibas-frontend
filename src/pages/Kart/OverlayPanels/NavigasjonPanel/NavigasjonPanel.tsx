import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { keyframes, styled } from "styled-components";
import { map } from "../../constants";
import { AbsolutePanel, PanelProps } from "../Panel";
import { KoordinaterSearch } from "./KoordinaterSearch";
import { InndelingSearch } from "./InndelingSearch";

export type NavigasjonProps = {
  onSelect: (north: number | null, east: number | null) => void;
};

const NavigasjonPanel = ({ isOpen, className }: PanelProps) => {
  const { closeOverlayModal } = useOverlayPanel();

  const centerOnCoordinate = (north: number | null, east: number | null) => {
    if (north !== null && east !== null) {
      const view = map.getView();
      view.animate({ duration: 0, center: [east, north], zoom: 18 });
      closeOverlayModal();
    }
  };

  return (
    <Container $isOpen={isOpen} className={className}>
      <CustomTabs size="md">
        <TabList>
          <Tab>Gå til inndeling</Tab>
          <Tab>Gå til koordinater</Tab>
        </TabList>
        <TabPanels>
          <StyledTabPanel>
            <InndelingSearch onSelect={centerOnCoordinate} />
          </StyledTabPanel>
          <StyledTabPanel>
            <KoordinaterSearch onSelect={centerOnCoordinate} />
          </StyledTabPanel>
        </TabPanels>
      </CustomTabs>
    </Container>
  );
};

const CustomTabs = styled(Tabs)`
  width: unset;
`;

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
  width: 800px;
  padding: 24px;
  animation: ${fadeIn} 0.25s ease-in-out;
  overflow: visible;
`;

const StyledTabPanel = styled(TabPanel)`
  padding-left: 0;
  padding-right: 0;
`;

export default NavigasjonPanel;
