import { useTranslation } from "react-i18next";
import styled from "styled-components";
import MainLayer from "./MainLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";

const Bakgrunnskart = () => {
  const { t } = useTranslation();
  const { isOpen: visible, togglePanel } = useSidebarPanel("kartlag");
  const { orderedLayerIds, updateMappedLayers } = useBakgrunnskart();

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle
        closePanel={togglePanel}
        title={t("sidebar.Kartlag")}
      />
      {orderedLayerIds.map((layerId, index) => (
        <MainLayer key={layerId} layerId={layerId} index={index} />
      ))}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

export default Bakgrunnskart;
