import styled from "styled-components";
import Delomrader from "./Delomrader";
import { EditGrenserProvider } from "./EditGrenserContext";
import Fylkesgrenser from "./Fylkesgrenser";
import GestligeInndelinger from "./GestligeInndelinger";
import Grunnkretser from "./Grunnkretser";
import Kommunegrenser from "./Kommunegrenser";
import MaritimeGrenser from "./MaritimeGrenser";
import Postnummeromraader from "./Postnummeromraader";
import Riksgrenser from "./Riksgrenser";
import Skolekretser from "./Skolekretser";
import Stemmekretser from "./Stemmekretser";
import Svalbardomradet from "./Svalbardomraadet";
import Accordion from "components/Accordion";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { UnstyledList } from "components/UnstyledList";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const GrenserDrillDown = () => {
  const { isOpen, togglePanel } = useSidebarPanel("nibas");

  return (
    <EditGrenserProvider isOpen={isOpen}>
      <Panel>
        <SidebarPanelTitle closePanel={togglePanel} title="Grenser" />
        <UnstyledList>
          <Riksgrenser />
          <Fylkesgrenser />
          <Kommunegrenser />
          <Stemmekretser />
          <Skolekretser />
          <Grunnkretser />
          <Delomrader />
          <Postnummeromraader />
          <GestligeInndelinger />
          <MaritimeGrenser />
          <Svalbardomradet />
        </UnstyledList>
      </Panel>
    </EditGrenserProvider>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 30px;

  > ${Accordion} > div {
    margin-left: 16px;
  }
`;

export default GrenserDrillDown;
