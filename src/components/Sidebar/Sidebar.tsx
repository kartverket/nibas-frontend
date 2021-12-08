import styled from "styled-components";
import Button from "components/Button";
import {
  OpenSidebarPanels,
  SidebarPanel,
} from "components/PageLayout/PageLayout";
import { ReactComponent as DraftsIcon } from "icons/drafts.svg";
import { ReactComponent as MapIcon } from "icons/map.svg";
import { ReactComponent as NibasIcon } from "icons/nibas.svg";
import { ReactComponent as SearchIcon } from "icons/search.svg";

type Props = {
  openPanels: OpenSidebarPanels;
  togglePanel: (panel: SidebarPanel) => void;
};

const Sidebar = ({ openPanels, togglePanel }: Props) => {
  return (
    <StyledSidebar>
      <SidebarButton
        active={openPanels.nibas}
        onClick={() => togglePanel("nibas")}
      >
        <NibasIcon />
      </SidebarButton>
      <SidebarButton active={openPanels.search}>
        <SearchIcon />
      </SidebarButton>
      <SidebarButton
        active={openPanels.backgroundLayers}
        onClick={() => togglePanel("backgroundLayers")}
      >
        <MapIcon />
      </SidebarButton>
      <SidebarButton active={openPanels.drafts}>
        <DraftsIcon />
      </SidebarButton>
    </StyledSidebar>
  );
};

const StyledSidebar = styled.div`
  grid-area: sidebar;
  width: 60px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 80px;
`;

type SidebarButtonProps = {
  active: boolean;
};

const SidebarButton = styled(Button).attrs(() => ({
  variant: "icon",
}))<SidebarButtonProps>`
  display: block;
  margin: 8px 0;
  padding: 8px;
  width: 100%;
  z-index: 2;

  border-top: 2px solid
    ${(props) => (props.active ? props.theme.colors.blue : "transparent")};
  border-bottom: 2px solid
    ${(props) => (props.active ? props.theme.colors.blue : "transparent")};
  border-right: 2px solid
    ${(props) => (props.active ? props.theme.colors.white : "transparent")};
  color: ${({ active, theme }) =>
    active ? theme.colors.blue : theme.colors.black};

  :hover {
    border-color: ${({ theme }) => theme.colors.blue};
    border-right-color: ${({ theme }) => theme.colors.white};
  }
`;

export default Sidebar;
