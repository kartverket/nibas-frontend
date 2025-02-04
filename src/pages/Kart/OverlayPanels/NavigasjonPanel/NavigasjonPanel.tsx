import { CloseButton, Spacer, Tab, TabList, TabPanel, TabPanels, Tabs } from "@kvib/react";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { keyframes, styled } from "styled-components";
import { map } from "../../constants";
import { AbsolutePanel } from "../Panel";
import { EiendomSearch } from "./EiendomSearch";
import { InndelingerSearch } from "./InndelingerSearch";
import { KoordinaterSearch } from "./KoordinaterSearch";

export type SearchProps = {
  onSearchSuccess: () => void;
};

export const centerOnCoordinate = (north: number | null, east: number | null) => {
  if (north !== null && east !== null) {
    const view = map.getView();
    view.animate({ duration: 0, center: [east, north], zoom: 18 });
  }
};

const NavigasjonPanel = () => {
  const { closeOverlayModal } = useOverlayPanel();

  return (
    <Container>
      <CustomTabs size="md">
        <TabList>
          <Tab>Gå til inndeling</Tab>
          <Tab>Gå til koordinater</Tab>
          <Tab>Gå til eiendom</Tab>
          <Spacer />
          <CloseButton onClick={() => closeOverlayModal()} aria-label="Lukk" />
        </TabList>
        <TabPanels>
          <StyledTabPanel>
            <InndelingerSearch onSearchSuccess={closeOverlayModal} />
          </StyledTabPanel>
          <StyledTabPanel>
            <KoordinaterSearch onSearchSuccess={closeOverlayModal} />
          </StyledTabPanel>
          <StyledTabPanel>
            <EiendomSearch onSearchSuccess={closeOverlayModal} />
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
  padding: 24px 24px 8px;
  border-radius: 8px;
  box-shadow: var(--kvib-shadows-lg);
  animation: ${fadeIn} 0.25s ease-in-out;
  overflow: visible;
`;

const StyledTabPanel = styled(TabPanel)`
  padding-left: 0;
  padding-right: 0;
`;

export default NavigasjonPanel;
