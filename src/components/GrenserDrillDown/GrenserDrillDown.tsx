import { useTranslation } from "react-i18next";
import styled from "styled-components";
import Fylkesgrenser from "./Fylkesgrenser";
import Grunnkretser from "./Grunnkretser";
import Kommunegrenser from "./Kommunegrenser";
import Stemmekretser from "./Stemmekretser";
import Accordion from "components/Accordion";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { UnstyledList } from "components/UnstyledList";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const GrenserDrillDown = () => {
  const { t } = useTranslation();
  const { activeSidebarPanel, closeSidebar } = useSidebarPanel();

  return (
    <Panel isOpen={activeSidebarPanel === "inndelinger"}>
      <SidebarPanelTitle
        closePanel={closeSidebar}
        title={t("sidebar.Inndelinger")}
      />
      <UnstyledList>
        <Fylkesgrenser />
        <Kommunegrenser />
        <Stemmekretser />
        <Grunnkretser />
      </UnstyledList>
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  > ${Accordion} > div {
    margin-left: 16px;
  }
`;

export default GrenserDrillDown;
