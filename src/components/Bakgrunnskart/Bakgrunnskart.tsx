import { useTranslation } from "react-i18next";
import styled from "styled-components";
import MainLayer from "./MainLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import Heading from "components/typography/Heading";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";

const Bakgrunnskart = () => {
  const { t } = useTranslation();
  const { isOpen: visible, togglePanel } = useSidebarPanel("kartlag");
  const { visibleLayers } = useBakgrunnskart();

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle closePanel={togglePanel} title={t("Aktive kartlag")} />
      {visibleLayers.map((layer, i) => (
        <MainLayer
          key={layer.mainLayer}
          layerId={layer.mainLayer}
          index={i}
          isAktiveKartlag={true}
          canDrag={true}
        />
      ))}
      <BackgroundLayersHeading tag="h3" size="xs">
        {t("sidebar.Kartlag")}
      </BackgroundLayersHeading>
      {Object.keys(bakgrunnskartLayers).map((layerId, index) => (
        <MainLayer
          key={layerId}
          layerId={layerId as BakgrunnskartId}
          index={index}
        />
      ))}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

const BackgroundLayersHeading = styled(Heading)`
  margin: 8px 0 0;
  border-bottom: 2px solid ${({ theme }) => theme.colors.grayLight};
`;

export default Bakgrunnskart;
