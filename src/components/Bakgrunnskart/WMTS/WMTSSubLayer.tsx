import WMTS from "ol/source/WMTS";
import BackgroundLayerAccordion from "../BackgroundLayer/BackgroundLayerAccordion";
import { BakgrunnskartId } from "hooks/layers/types";
import { MappedLayer } from "utils/getLayersFromWMS";
import { getLayerById, isWMTSLayer } from "utils/map/layers";
import { useBakgrunnskart } from "contexts/BakgrunnskartContext";
import { useMemo } from "react";

type Props = {
  subLayer: MappedLayer;
  sourceId: BakgrunnskartId;
  isAktivtKartlag?: boolean;
};

const WMTSSubLayer = ({ subLayer, sourceId, isAktivtKartlag }: Props) => {
  const { toggleLayerVisibility, subLayerIsVisible } = useBakgrunnskart();

  const subBackgroundLayerIsVisible = useMemo(
    () => subLayerIsVisible(sourceId, subLayer.title),
    [sourceId, subLayer.title, subLayerIsVisible]
  );

  const onSubLayerClick = () => {
    // hent originale sourcen med config
    // lag ny source basert på options med det nye laget
    const layer = getLayerById(sourceId);

    if (!isWMTSLayer(layer)) return;

    const source = layer.getSource();
    if (source) {
      const newSource = new WMTS({
        ...source.get("config"),
        layer: subLayer.id,
      });
      newSource.set("config", source.get("config"));
      layer.setSource(newSource);
    }

    toggleLayerVisibility(sourceId, subLayer.title);
  };

  return (
    <BackgroundLayerAccordion
      key={subLayer.title}
      indent={1}
      mappedLayer={subLayer}
      onVisibilityClick={onSubLayerClick}
      visible={subBackgroundLayerIsVisible}
      isAktiveKartlag={isAktivtKartlag}
    >
      {null}
    </BackgroundLayerAccordion>
  );
};

export default WMTSSubLayer;
