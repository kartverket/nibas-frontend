import { useTranslation } from "react-i18next";
import styled from "styled-components";
import UtkastList from "./UtkastList";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const UtkastPanel = () => {
  const { activeSidebarPanel, closeSidebar } = useSidebarPanel();
  const { t } = useTranslation();

  return (
    <Panel isOpen={activeSidebarPanel === "utkast"}>
      <SidebarPanelTitle
        closePanel={closeSidebar}
        title={t("sidebar.Utkast")}
      />
      <UtkastList />
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  min-height: 450px;
`;

export default UtkastPanel;
