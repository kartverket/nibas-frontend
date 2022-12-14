import { useTranslation } from "react-i18next";
import styled from "styled-components";
import UtkastList from "./UtkastList";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const UtkastPanel = () => {
  const { isOpen, togglePanel } = useSidebarPanel("utkast");
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Panel>
      <SidebarPanelTitle closePanel={togglePanel} title={t("sidebar.Utkast")} />
      <UtkastList />
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  min-height: 450px;
`;

export default UtkastPanel;
