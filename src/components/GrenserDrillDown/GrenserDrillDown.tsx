import { useTranslation } from "react-i18next";
import Fylkesgrenser from "./Fylkesgrenser";
import Grunnkretser from "./Grunnkretser";
import Kommunegrenser from "./Kommunegrenser";
import Stemmekretser from "./Stemmekretser";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { UnstyledList } from "components/UnstyledList";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const GrenserDrillDown = () => {
  const { t } = useTranslation();
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();

  return (
    <SidebarPanel isOpen={activeSidebarPanel === "inndelinger"}>
      <SidebarPanelTitle
        closePanel={closeSidebarPanel}
        title={t("sidebar.Inndelinger")}
      />
      <UnstyledList>
        <Fylkesgrenser />
        <Kommunegrenser />
        <Stemmekretser />
        <Grunnkretser />
      </UnstyledList>
    </SidebarPanel>
  );
};

export default GrenserDrillDown;
