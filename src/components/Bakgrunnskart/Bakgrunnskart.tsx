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

  const openLayers = Object.keys(visibleLayers).filter(
    (id) => visibleLayers[id as BakgrunnskartId]
  );

  return (
    <Panel>
      <SidebarPanelTitle closePanel={togglePanel} title={t("Aktive kartlag")} />
      {openLayers.map((id, i) => (
        <MainLayer
          key={id}
          layerId={id as BakgrunnskartId}
          index={i}
          isAktiveKartlag={true}
          canDrag={true}
        />
      ))}
      <ActiveBackgroundLayers tag="h3" size="xs">
        {t("sidebar.Kartlag")}
      </ActiveBackgroundLayers>
      {orderedLayerIds.map((layerId, index) => (
        <MainLayer
          key={layerId}
          layerId={layerId}
          index={index}
          canDrag={true}
        />
      ))}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

const ActiveBackgroundLayers = styled(Heading)`
  margin: 8px 0 0;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grayLight};
`;

export default Bakgrunnskart;
