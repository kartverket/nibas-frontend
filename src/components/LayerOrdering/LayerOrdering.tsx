import { useEffect, useState } from "react";
import styled from "styled-components";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import {
  getLayersArray,
  getWMSLayersInMap,
  isLayerVisible,
  toggleLayerVisibility,
} from "utils/map/layers";
import BakgrunnskartOptions from "./BakgrunnskartOptions";
import { map } from "components/Map/constants";
import { MapInteractable } from "components/Map/MapInteractable";

const LayerOrdering = () => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);
  const [editingLayer, setEditingLayer] = useState<MainMappedLayer | null>(
    null
  );

  useEffect(() => {
    const updateMappedLayers = async () => {
      const wmsLayers = getWMSLayersInMap(map);

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
  }, []);

  const getLayerIdFromMappedLayer = (mappedLayer: MainMappedLayer) => {
    const layers = getLayersArray(map);
    const layer = layers.find(
      (layer) => layer.get("id") === mappedLayer.sourceId
    );

    if (!layer) return;

    return layer.get("id");
  };

  const toggleMainLayer = (mappedLayer: MainMappedLayer) => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    toggleLayerVisibility(map, layerId);
  };

  const isMainLayerVisible = (mappedLayer: MainMappedLayer) => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    return isLayerVisible(map, layerId);
  };

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
