import { useEffect, useState } from "react";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";
import styled from "styled-components";
import { GeometryVectorSource } from "../../hooks/sources/types";
import { getMatWFSFeatures } from "../../utils/getMatrikkelWfsFeatures";
import { addFeaturesToSource } from "../../utils/map/source";
import Button from "../Button";
import MainBackgroundLayer from "./BackgroundLayer/MainBackgroundLayer";
import { SidebarPanel } from "components/Sidebar/SidebarPanel";
import SidebarPanelTitle from "components/Sidebar/SidebarPanelTitle";
import { useSidebarPanel } from "contexts/SidebarPanelContext";
import { bakgrunnskartLayers } from "hooks/layers/constants";
import { BakgrunnskartId, LayerId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
import getSubLayersFromWMSSource, {
  MainMappedLayer,
} from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer } from "utils/map/layers";

const isWmsLayer = (layer: BaseLayer): layer is TileLayer<TileWMS> => {
  return layer instanceof TileLayer;
};

const isVectorLayer = (
  layer: BaseLayer
): layer is VectorLayer<GeometryVectorSource> => {
  return layer instanceof VectorLayer;
};

const Bakgrunnskart = () => {
  const [mappedLayers, setMappedLayers] = useState<MainMappedLayer[]>([]);

  const { isOpen: visible, togglePanel } = useSidebarPanel("backgroundLayers");

  const { visibleLayers, dispatch } = useVisibleLayers();
  const { moveLayer, zIndexes } = useZIndexes();

  useEffect(() => {
    if (!visible || mappedLayers.length > 0) return;

    let isMounted = true;

    const updateMappedLayers = async () => {
      const layers = Object.values(bakgrunnskartLayers);

      const mappedLayerPromises: Promise<MainMappedLayer | null>[] = [];

      layers.forEach((layer) => {
        if (isWmsLayer(layer)) {
          mappedLayerPromises.push(
            getSubLayersFromWMSSource(layer.getSource())
          );
        } else if (isVectorLayer(layer)) {
          // todo
        }
      });

      const mappedLayers = await Promise.all(mappedLayerPromises);

      const nonNullLayers = mappedLayers.filter(
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

  const fetchMatrikkelWfsFeatures = async () => {
    const features = await getMatWFSFeatures();
    if (!features) return null;
    addFeaturesToSource("matrikkelenWfs", features);
  };

  const renderMainLayerByZIndex = (layerId: BakgrunnskartId, i: number) => {
    const layer = bakgrunnskartLayers[layerId];

    if (isWmsLayer(layer)) {
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
    } else if (isVectorLayer(layer)) {
      return (
        <div>
          <Button onClick={fetchMatrikkelWfsFeatures}>fetch wfs</Button>
          <p>{layerId}</p>
        </div>
      );
    }
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
