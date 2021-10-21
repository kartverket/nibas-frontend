import { map } from "components/Map/constants";
import { MapInteractable } from "components/Map/Map";
import { useEffect, useState } from "react";
import styled from "styled-components";
import getLayersFromWMS, { MappedLayer } from "utils/getLayersFromWMS";
import { getWMSLayersInMap } from "utils/map/layers";
import BakgrunnskartOptions from "./BakgrunnskartOptions";

const LayerOrdering = () => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);
  const [editingLayer, setEditingLayer] = useState<MappedLayer | null>(null);

  useEffect(() => {
    const updateMappedLayers = async () => {
      const wmsLayers = getWMSLayersInMap(map);

      const mappedLayersPromises = wmsLayers.map((layer) =>
        getLayersFromWMS(layer.getSource())
      );

      const layers = await Promise.all(mappedLayersPromises);

      const nonNullLayers = layers.filter(
        (layer) => layer !== null
      ) as MappedLayer[];

      setMappedLayers(nonNullLayers);
    };

    updateMappedLayers();
  }, []);

  return (
    <CenterAlignment>
      <SideBySide>
        <BakgrunnslagSelector>
          {mappedLayers.map((mappedLayer) => (
            <div key={mappedLayer.title}>
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
