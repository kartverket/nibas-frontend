import styled from "styled-components";
import Bakgrunnskart from "components/Bakgrunnskart";
import GrenserDrillDown from "components/GrenserDrillDown";

const SidebarPanels = () => {
  return (
    <Wrapper>
      <GrenserDrillDown />
      <Bakgrunnskart />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  grid-area: sidebar;
`;

export default SidebarPanels;
