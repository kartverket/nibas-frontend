import { useTranslation } from "react-i18next";
import styled from "styled-components";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import WFSBackgroundLayer from "./WFS/WFSBackgroundLayer";
import WMTSBackgroundLayer from "./WMTS/WMTSBackgroundLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import { isVectorLayer, isWMSLayer, isWMTSLayer } from "utils/map/layers";

const Bakgrunnskart = () => {
  const { t } = useTranslation();
  const { isOpen: visible, togglePanel } = useSidebarPanel("kartlag");
  const {
    mappedLayers,
    moveLayer,
    toggleLayerVisibility,
    visibleLayers,
    zIndexes,
  } = useBakgrunnskart();

  const renderMainLayerByZIndex = (layerId: BakgrunnskartId, i: number) => {
    const layer = bakgrunnskartLayers[layerId];

    const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);

    if (!mappedLayer) return null;

    if (isWMSLayer(layer)) {
      return (
        <MainBackgroundLayer
          key={mappedLayer.title}
          mappedLayer={mappedLayer}
          mainLayerSourceId={mappedLayer.sourceId}
          mainLayerName={mappedLayer.id ?? ""}
          visible={visibleLayers[layerId]}
          toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
          index={i}
          moveLayer={moveLayer}
        />
      );
    }

    if (isWMTSLayer(layer)) {
      return (
        <WMTSBackgroundLayer
          key={mappedLayer.title}
          mappedLayer={mappedLayer}
          visible={visibleLayers[layerId]}
          toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
          index={i}
          moveLayer={moveLayer}
        />
      );
    }

    if (isVectorLayer(layer)) {
      return (
        <WFSBackgroundLayer
          key={mappedLayer.title}
          mappedLayer={mappedLayer}
          visible={visibleLayers[layerId]}
          toggleLayerVisibility={() => toggleLayerVisibility(layerId)}
          index={i}
          moveLayer={moveLayer}
        />
      );
    }
  };

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle
        closePanel={togglePanel}
        title={t("sidebar.Kartlag")}
      />
      {zIndexes.map(renderMainLayerByZIndex)}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

export default Bakgrunnskart;
