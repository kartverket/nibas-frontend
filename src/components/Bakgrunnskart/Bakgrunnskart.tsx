import { useTranslation } from "react-i18next";
import styled from "styled-components";
import MainLayer from "./MainLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { BakgrunnskartId } from "hooks/layers/types";
import Heading from "components/typography/Heading";

const Bakgrunnskart = () => {
  const { t } = useTranslation();
  const { isOpen: visible, togglePanel } = useSidebarPanel("kartlag");
  const { orderedLayerIds, visibleLayers } = useBakgrunnskart();

  if (!visible) return null;

  //const { visibleLayers } = useBakgrunnskart();

  const openLayers = Object.keys(visibleLayers).filter(
    (id) => visibleLayers[id as BakgrunnskartId]
  );

  return (
    <Panel>
      <ActiveBackgroundLayers tag="h3" size="xs">
        {t("Aktive bakgrunnskart")}
      </ActiveBackgroundLayers>
      {openLayers.map((id, i) => (
        <MainLayer
          key={id}
          layerId={id as BakgrunnskartId}
          index={i}
          canDrag={false}
        />
      ))}
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

const ActiveBackgroundLayers = styled(Heading)`
  margin: 8px 0 0;
  border-bottom: 4px solid ${({ theme }) => theme.colors.blueDark};
`;

export default Bakgrunnskart;
