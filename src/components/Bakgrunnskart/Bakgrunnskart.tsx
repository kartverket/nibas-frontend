import { useEffect, useState } from "react";
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
import { isVectorLayer, isWmsLayer, isWMTSLayer } from "utils/map/layers";

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
        if (isVectorLayer(layer)) return;

        mappedLayerPromises.push(getSubLayersFromWMSSource(layer.getSource()));
      });

      const mappedLayers = await Promise.all(mappedLayerPromises);

      layers
        .filter((layer) => isVectorLayer(layer))
        // .map((layer) => layer as VectorLayer<VectorSource<Geometry>>) // todo tok in layeret i mapping for å sette SourceId.. men det finnes ikke på dette tidspunktet
        .map(() => mapVectorLayer())
        .forEach((mappedLayer) => mappedLayers.push(mappedLayer));

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
          mainLayerName={mappedLayer.id ?? ""}
          visible={visibleLayers[layerId]}
          toggleLayerVisibility={() => dispatch(toggleLayerVisibility(layerId))}
          index={i}
          moveLayer={moveLayer}
        />
      );
    }

    if (isWMTSLayer(layer)) {
      const mappedLayer = mappedLayers.find(
        (mappedLayer) => mappedLayer.sourceId === layerId
      );

      if (!mappedLayer) return null;

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
      const mappedLayer = mappedLayers.find(
        (mappedLayer) => mappedLayer.sourceId === layerId
      );

      if (!mappedLayer) return null;

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
      <SidebarPanelTitle closePanel={togglePanel} title="Bakgrunnskart" />
      {zIndexes.map(renderMainLayerByZIndex)}
    </Panel>
  );
};

const Panel = styled(SidebarPanel)`
  margin-top: 180px;
`;

export default Bakgrunnskart;
