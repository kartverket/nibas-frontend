import { useTranslation } from "react-i18next";
import UtkastList from "./UtkastList";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const UtkastPanel = () => {
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();
  const { t } = useTranslation();

  return (
    <SidebarPanel isOpen={activeSidebarPanel === "utkast"}>
      <SidebarPanelTitle
        closePanel={closeSidebarPanel}
        title={t("sidebar.Utkast")}
      />
      <UtkastList />
    </SidebarPanel>
  );
};

export default UtkastPanel;
