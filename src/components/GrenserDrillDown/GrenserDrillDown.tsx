import { useTranslation } from "react-i18next";
import styled from "styled-components";
import AktiveKartlag from "./AktiveKartlag";
import Delomrader from "./Delomrader";
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
import Tabs from "components/Tabs";
import { UnstyledList } from "components/UnstyledList";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const GrenserDrillDown = () => {
  const { isOpen, togglePanel } = useSidebarPanel("inndelinger");

  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Panel>
      <Tabs
        tabTransKeys={["sidebar.Inndelinger", "inndelinger.Aktive kartlag"]}
      >
        <div>
          <SidebarPanelTitle
            closePanel={togglePanel}
            title={t("sidebar.Inndelinger")}
          />
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
        </div>
        <div>
          <SidebarPanelTitle
            closePanel={togglePanel}
            title={t("inndelinger.Aktive kartlag")}
          />

          <AktiveKartlag />
        </div>
      </Tabs>
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 30px;

  > ${Accordion} > div {
    margin-left: 16px;
  }
`;

export default GrenserDrillDown;
