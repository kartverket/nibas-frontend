import styled from "styled-components";
import Bakgrunnskart from "components/Bakgrunnskart";
import GrenserDrillDown from "components/GrenserDrillDown";
import UtkastPanel from "components/UtkastPanel";

const SidebarPanels = () => {
  return (
    <Wrapper>
      <GrenserDrillDown />
      <Bakgrunnskart />
      <UtkastPanel />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  grid-area: panel;
`;

export default SidebarPanels;
