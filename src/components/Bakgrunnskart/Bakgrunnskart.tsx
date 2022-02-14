import { useEffect, useState } from "react";
import styled from "styled-components";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
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
import { isWMTSLayer } from "utils/map/layers";

const Bakgrunnskart = () => {
  const { isOpen: visible, togglePanel } = useSidebarPanel("backgroundLayers");
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, zIndexes } = useZIndexes();

  useEffect(() => {
    if (!visible || mappedLayers.length > 0) return;

    let isMounted = true;

    const updateMappedLayers = async () => {
      const mappedLayersPromises = Object.values(bakgrunnskartLayers).map(
        (layer) => getSubLayersFromWMSSource(layer.getSource())
      );

      const layers = await Promise.all(mappedLayersPromises);

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
    const mappedLayer = mappedLayers.find(
      (mappedLayer) => mappedLayer.sourceId === layerId
    );

    if (!mappedLayer) return null;

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
  };

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle closePanel={togglePanel} title="Bakgrunnskart" />
      {zIndexes.map(renderMainLayerByZIndex)}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

export default Bakgrunnskart;
