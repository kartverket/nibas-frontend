import { useEffect, useState } from "react";
import styled from "styled-components";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer, getWMSLayersInMap } from "utils/map/layers";
import BakgrunnskartOptions from "./BakgrunnskartOptions";
import { MapInteractable } from "components/Map/MapInteractable";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";

type Props = {
  visible: boolean;
  visibleLayers: ReturnType<typeof useVisibleLayers>["visibleLayers"];
  dispatch: ReturnType<typeof useVisibleLayers>["dispatch"];
};

const LayerOrdering = ({ visible, visibleLayers, dispatch }: Props) => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);
  const [editingLayer, setEditingLayer] = useState<MainMappedLayer | null>(
    null
  );

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

    if (!layerId) return;

    return visibleLayers[layerId];
  };

  if (!visible) return null;

  return (
    <CenterAlignment>
      <SideBySide>
        <BakgrunnslagSelector>
          {mappedLayers.map((mappedLayer) => (
            <div key={mappedLayer.title}>
              <input
                type="checkbox"
                onChange={() => toggleMainLayer(mappedLayer)}
                checked={isMainLayerVisible(mappedLayer)}
              />
              <span>{mappedLayer.title}</span>
              <button onClick={() => setEditingLayer(mappedLayer)}>Edit</button>
            </div>
          ))}
        </BakgrunnslagSelector>
        {editingLayer && (
          <BakgrunnskartOptions
            editingLayer={editingLayer}
            closeMenu={() => setEditingLayer(null)}
          />
        )}
      </SideBySide>
    </CenterAlignment>
  );
};

const CenterAlignment = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const SideBySide = styled.div`
  display: flex;
`;

const BakgrunnslagSelector = styled(MapInteractable)`
  height: 600px;
  width: 200px;
  overflow: auto;
`;

export default LayerOrdering;
