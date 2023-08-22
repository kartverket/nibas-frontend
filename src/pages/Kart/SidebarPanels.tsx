import { styled } from "styled-components";
import GrenserDrillDown from "components/GrenserDrillDown";

const SidebarPanels = () => {
  return (
    <Wrapper>
      <GrenserDrillDown />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  grid-area: sidebar;
`;

export default SidebarPanels;
