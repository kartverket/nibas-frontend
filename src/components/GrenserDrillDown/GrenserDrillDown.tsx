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
import Tabs, { Tab, useTabs } from "components/Tabs";
import { UnstyledList } from "components/UnstyledList";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const GrenserDrillDown = () => {
  const { isOpen, togglePanel } = useSidebarPanel("inndelinger");

  const { t } = useTranslation();
  const tabs = useTabs(["Grenser", "Aktive kartlag"]);

  if (!isOpen) return null;

  return (
    <Panel>
      <Tabs
        tabs={tabs.ids}
        openTab={tabs.openTab}
        selectedTab={tabs.selectedTab}
      >
        <Tab value={tabs.ids["Grenser"]} selectedTab={tabs.selectedTab}>
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
        </Tab>
        <Tab value={tabs.ids["Aktive kartlag"]} selectedTab={tabs.selectedTab}>
          <SidebarPanelTitle closePanel={togglePanel} title="Aktive kartlag" />

          <AktiveKartlag />
        </Tab>
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
