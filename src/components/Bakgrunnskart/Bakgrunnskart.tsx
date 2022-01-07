import { useEffect, useState } from "react";
import styled from "styled-components";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import {
  SidebarPanel,
  SidebarPanelTitle,
} from "components/Sidebar/SidebarPanel";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer } from "utils/map/layers";

type Props = {
  visible: boolean;
};

const Bakgrunnskart = ({ visible }: Props) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, zIndexes } = useZIndexes();

  useEffect(() => {
    if (!visible || mappedLayers.length > 0) return;

    const updateMappedLayers = async () => {
      const mappedLayersPromises = Object.values(bakgrunnskartLayers).map(
        (layer) => getSubLayersFromWMSSource(layer.getSource())
      );

      const layers = await Promise.all(mappedLayersPromises);

      const nonNullLayers = layers.filter(
        (layer) => layer !== null
      ) as MainMappedLayer[];

      setMappedLayers(nonNullLayers);
    };

    updateMappedLayers();
  }, [visible, mappedLayers.length]);

  const toggleMainLayer = (mappedLayer: MainMappedLayer) => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return;

    dispatch(toggleLayerVisibility(layerId));
  };

  const isMainLayerVisible = (mappedLayer: MainMappedLayer) => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return false;

    return visibleLayers[layerId];
  };

  const renderMainLayerByZIndex = (layerId: LayerId, i: number) => {
    const mappedLayer = mappedLayers.find(
      (mappedLayer) => mappedLayer.sourceId === layerId
    );

    if (!mappedLayer) return null;

    return (
      <MainBackgroundLayer
        key={mappedLayer.title}
        mappedLayer={mappedLayer}
        mainLayerSourceId={mappedLayer.sourceId}
        mainLayerName={mappedLayer.name ?? ""}
        toggleMainLayer={toggleMainLayer}
        isMainLayerVisible={isMainLayerVisible}
        index={i}
        moveLayer={moveLayer}
      />
    );
  };

  if (!visible) return null;

  return (
    <Panel>
      <SidebarPanelTitle>Bakgrunnskart</SidebarPanelTitle>
      {zIndexes.map(renderMainLayerByZIndex)}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

export default Bakgrunnskart;
