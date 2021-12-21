import { useState } from "react";
import styled from "styled-components";
import Kart from "components/Kart";
import Sidebar from "components/Sidebar";
import TopBar from "components/TopBar";

export type SidebarPanel = "nibas" | "search" | "backgroundLayers" | "drafts";
export type OpenSidebarPanels = Record<SidebarPanel, boolean>;

const getClosedPanels = () => ({
  nibas: false,
  search: false,
  backgroundLayers: false,
  drafts: false,
});

const PageLayout = () => {
  const [openPanels, setOpenPanels] = useState<OpenSidebarPanels>(
    getClosedPanels()
  );

  const setPanel = (panel: SidebarPanel, value: boolean) => {
    const newPanels = {
      ...getClosedPanels(),
      [panel]: value,
    };

    setOpenPanels(newPanels);
  };

  const togglePanel = (panel: SidebarPanel) =>
    setPanel(panel, !openPanels[panel]);

  return (
    <Grid>
      <TopBar />
      <Sidebar openPanels={openPanels} togglePanel={togglePanel} />
      <Kart openPanels={openPanels} />
    </Grid>
  );
};

const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    ". topbar"
    "sidebar map";
`;

export default PageLayout;
