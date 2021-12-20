import { useEffect, useState } from "react";
import styled from "styled-components";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import { MapInteractable } from "components/Map/MapInteractable";
import { LayerId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer, getWMSLayersInMap } from "utils/map/layers";

type Props = {
  visible: boolean;
  visibleLayers: ReturnType<typeof useVisibleLayers>["visibleLayers"];
  dispatch: ReturnType<typeof useVisibleLayers>["dispatch"];
  moveLayer: (direction: "up" | "down", layerId: LayerId) => void;
  layersInZIndexOrder: LayerId[];
};

const Bakgrunnskart = ({
  visible,
  visibleLayers,
  dispatch,
  moveLayer,
  layersInZIndexOrder,
}: Props) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  useEffect(() => {
    if (!visible || mappedLayers.length > 0) return;

    const updateMappedLayers = async () => {
      const wmsLayers = getWMSLayersInMap();

      const mappedLayersPromises = wmsLayers.map((layer) =>
        getSubLayersFromWMSSource(layer.getSource())
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

  return <Panel>{layersInZIndexOrder.map(renderMainLayerByZIndex)}</Panel>;
};

const Panel = styled(MapInteractable)`
  min-height: 400px;
  max-height: 80%;
  width: 400px;
  margin-top: 180px;
  border: 2px solid ${({ theme }) => theme.colors.blue};
  padding: 8px;
  overflow: auto;
`;

export default Bakgrunnskart;
