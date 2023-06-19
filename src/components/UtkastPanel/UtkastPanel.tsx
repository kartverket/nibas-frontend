import UtkastList from "./UtkastList";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const UtkastPanel = () => {
  const { activeSidebarPanel, closeSidebarPanel } = useSidebarPanel();

  return (
    <SidebarPanel isOpen={activeSidebarPanel === "utkast"}>
      <SidebarPanelTitle closePanel={closeSidebarPanel} title="Utkast" />
      {activeSidebarPanel === "utkast" && <UtkastList />}
    </SidebarPanel>
  );
};

export default UtkastPanel;
