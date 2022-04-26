import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { mapVectorLayer } from "../../utils/getMatrikkelWfsFeatures";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import WFSBackgroundLayer from "./WFS/WFSBackgroundLayer";
import WMTSBackgroundLayer from "./WMTS/WMTSBackgroundLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { isVectorLayer, isWMSLayer, isWMTSLayer } from "utils/map/layers";

const Bakgrunnskart = () => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const { isOpen: visible, togglePanel } = useSidebarPanel("kartlag");

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, zIndexes } = useZIndexes();

  const { t } = useTranslation();

  useEffect(() => {
    if (!visible || mappedLayers.length > 0) return;

    let isMounted = true;

    const updateMappedLayers = async () => {
      const mappedLayerPromises: Promise<MainMappedLayer | null>[] = [];
      Object.values(bakgrunnskartLayers).forEach((layer) => {
        if (isVectorLayer(layer)) {
          mappedLayerPromises.push(mapVectorLayer());
          return;
        }

        mappedLayerPromises.push(getSubLayersFromWMSSource(layer.getSource()));
      });

      const layers = await Promise.all(mappedLayerPromises);

      const nonNullLayers = layers.filter(
        (layer) => layer !== null
      ) as MainMappedLayer[];

      if (isMounted) {
        setMappedLayers(nonNullLayers);
      }
    };

    updateMappedLayers();

    return () => {
      isMounted = false;
    };
  }, [visible, mappedLayers.length]);

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
          toggleLayerVisibility={() => dispatch(toggleLayerVisibility(layerId))}
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
          toggleLayerVisibility={() => dispatch(toggleLayerVisibility(layerId))}
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
          toggleLayerVisibility={() => dispatch(toggleLayerVisibility(layerId))}
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
