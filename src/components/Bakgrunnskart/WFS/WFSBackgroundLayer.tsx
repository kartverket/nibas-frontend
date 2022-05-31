import { BakgrunnskartId } from "../../../hooks/layers/types";
import { MainMappedLayer } from "../../../utils/getLayersFromWMS";
import { getMatWFSFeatures } from "../../../utils/getMatrikkelWfsFeatures";
import {
  getLayerById,
  getLayerIdFromMappedLayer,
} from "../../../utils/map/layers";
import { addFeaturesToSource } from "../../../utils/map/source";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import useBackgroundLayerDND from "../BackgroundLayer/useBackgroundLayerDND";

type Props = {
  mappedLayer: MainMappedLayer;
  visible: boolean;
  toggleLayerVisibility: () => void;
  index: number;
  moveLayer?: (direction: "up" | "down", layerId: BakgrunnskartId) => void;
};

const WFSBackgroundLayer = ({
  mappedLayer,
  visible,
  toggleLayerVisibility,
  index,
  moveLayer,
}: Props) => {
  const ref = useBackgroundLayerDND(index, mappedLayer, moveLayer);

  const onVisibilityClick = () => {
    const layerId = getLayerIdFromMappedLayer(mappedLayer);

    if (!layerId) return;

    if (!visible) {
      fetchMatrikkelWfsFeatures();
    }

    toggleLayerVisibility();
  };

  return (
    <BackgroundLayerAccordion
      isMainLayer
      indent={0}
      mappedLayer={mappedLayer}
      onVisibilityClick={onVisibilityClick}
      visible={visible}
      ref={moveLayer ? ref : null}
    >
      {null}
    </BackgroundLayerAccordion>
  );
};

export default WFSBackgroundLayer;

const fetchMatrikkelWfsFeatures = async () => {
  const features = await getMatWFSFeatures();
  if (!features) return null;
  getLayerById("matrikkelenWfs").getSource().clear();
  addFeaturesToSource("matrikkelenWfs", features);
};
