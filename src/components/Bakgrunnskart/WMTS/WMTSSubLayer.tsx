import WMTS from "ol/source/WMTS";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import { BakgrunnskartId } from "hooks/layers/types";
import { bakgrunnskartSources } from "hooks/sources/syncSources";
import { MappedLayer } from "utils/getLayersFromWMS";
import { getLayerById } from "utils/map/layers";

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
    // console.log(subLayer);
    const source = bakgrunnskartSources[sourceId] as WMTS;
    // console.log(source);
    const newSource = new WMTS({ ...source.get("config"), layer: subLayer.id });
    // source.set("layer", subLayer.id ?? "");
    source.set("config", source.get("config"));
    const layer = getLayerById(sourceId);
    layer.setSource(newSource);

    updateActiveSubLayer();
  };

  // const isSubLayerVisible = (subLayer: MappedLayer) => {
  //   const source = bakgrunnskartSources[sourceId] as WMTS;
  //   const activeLayer = source.getLayer();
  //   console.log(subLayer);
  //   console.log(activeLayer);

  //   return subLayer.id === activeLayer;
  // };

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
