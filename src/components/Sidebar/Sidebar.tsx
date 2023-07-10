import styled from "styled-components";
import SidebarButton from "./SidebarButton";
import Icon from "components/Icon";

const Sidebar = () => (
  <StyledSidebar>
    <ButtonsWrapper>
      <SidebarButton
        title="Inndelinger"
        panel="inndelinger"
        icon={<SidebarIcon icon="space_dashboard" />}
      />
      <SidebarButton
        title="Kartlag"
        panel="kartlag"
        icon={<SidebarIcon icon="map" />}
      />
    </ButtonsWrapper>
  </StyledSidebar>
);

const StyledSidebar = styled.div`
  grid-area: sidebar;
  width: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-right: none;
  overflow: hidden;
`;

const ButtonsWrapper = styled.div`
  margin-right: 0px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SidebarIcon = styled(Icon)`
  font-size: 42px;
`;

export default Sidebar;
