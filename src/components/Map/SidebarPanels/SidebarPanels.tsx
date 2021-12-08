import styled from "styled-components";
import GrenserDrillDown from "components/GrenserDrillDown";
import LayerOrdering from "components/LayerOrdering";
import { OpenSidebarPanels } from "components/PageLayout/PageLayout";

type Props = {
  openPanels: OpenSidebarPanels;
};

const SidebarPanels = ({ openPanels }: Props) => {
  return (
    <Wrapper>
      <GrenserDrillDown visible={openPanels.nibas} />
      <LayerOrdering visible={openPanels.backgroundLayers} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  grid-area: panel;
`;

export default SidebarPanels;
