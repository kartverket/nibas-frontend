import WMTS from "ol/source/WMTS";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import { BakgrunnskartId } from "hooks/layers/types";
import { MappedLayer } from "utils/getLayersFromWMS";
import { getLayerById, isWMTSLayer } from "utils/map/layers";

type Props = {
  subLayer: MappedLayer;
  sourceId: BakgrunnskartId;
  activeSubLayer: string;
  updateActiveSubLayer: () => void;
};

const WMTSSubLayer = ({
  subLayer,
  sourceId,
  activeSubLayer,
  updateActiveSubLayer,
}: Props) => {
  const onSubLayerClick = () => {
    // hent originale sourcen med config
    // lag ny source basert på options med det nye laget
    const layer = getLayerById(sourceId);

    if (!isWMTSLayer(layer)) return;

    const source = layer.getSource();
    const newSource = new WMTS({ ...source.get("config"), layer: subLayer.id });
    layer.setSource(newSource);

    updateActiveSubLayer();
  };

  return (
    <BackgroundLayerAccordion
      key={subLayer.title}
      indent={1}
      mappedLayer={subLayer}
      onVisibilityClick={onSubLayerClick}
      visible={activeSubLayer === subLayer.id}
    >
      {null}
    </BackgroundLayerAccordion>
  );
};

export default WMTSSubLayer;
