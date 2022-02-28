import { useEffect, useState } from "react";
import { MainMappedLayer, MappedLayer } from "utils/getLayersFromWMS";
import { getLayerById } from "utils/map/layers";

type Props = {
  isMainLayer?: boolean;
  mappedLayer: MainMappedLayer | MappedLayer;
};

const useLayerOpacity = (props: Props) => {
  const [opacity, setOpacity] = useState<number | undefined>();

  const onSliderChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setOpacity(parseInt(event.target.value, 10));

  // hvis hovedlag, hent gjennomsiktighet fra laget i OpenLayers
  useEffect(() => {
    if (!props.isMainLayer) return;

    const layerId = (props.mappedLayer as MainMappedLayer).sourceId;

    try {
      const layer = getLayerById(layerId);

      setOpacity(layer.getOpacity() * 100);
    } catch (error) {
      // hvis laget ikke finnes trenger ikke slider å gjøre noe
    }
  }, [props.isMainLayer, props.mappedLayer]);

  useEffect(() => {
    if (!props.isMainLayer) return;
    if (opacity === undefined) return;

    const layerId = (props.mappedLayer as MainMappedLayer).sourceId;

    try {
      const layer = getLayerById(layerId);

      // slider går mellom 0 og 100
      layer.setOpacity(opacity / 100);
    } catch (error) {
      // hvis laget ikke finnes trenger ikke slider å gjøre noe
    }
  }, [props.isMainLayer, props.mappedLayer, opacity]);

  return {
    opacity,
    onSliderChange,
  };
};

export default useLayerOpacity;
