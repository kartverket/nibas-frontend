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
  const { activeSidebarPanel, closeSidebar } = useSidebarPanel();
  const { visibleLayers } = useBakgrunnskart();

  if (activeSidebarPanel !== "kartlag") return null;

  return (
    <SidebarPanel>
      <SidebarPanelTitle
        closePanel={closeSidebar}
        title={t("Aktive kartlag")}
      />
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
    </SidebarPanel>
  );
};

const BackgroundLayersHeading = styled(Heading)`
  margin: 8px 0 0;
  border-bottom: 2px solid var(--gray_light);
`;

export default Bakgrunnskart;
