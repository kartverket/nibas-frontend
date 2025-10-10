import { MapBrowserEvent } from "ol";
import type { Feature } from "ol";
import { useFeatureStyle } from "../../../contexts/FeatureStyleContext/FeatureStyleContext";
import { Tool } from "../../../contexts/ToolbarContext";
import { useGetFeatures } from "./interaction-utils";
import type { LineString } from "ol/geom";

export const exclusiveSelectTools: Tool[] = ["grenseinfo", "split"];

export type SelectFeature = {
  feature: Feature<LineString>;
  clicked: boolean;
};

const useSelect = () => {
  const { selectFeatures, clearSelection } = useFeatureStyle();
  const { getLineStringFeaturesAtPixel } = useGetFeatures();

  const select = (event: MapBrowserEvent<PointerEvent>) => {
    if (event.dragging) {
      return;
    }
    console.log("running select");

    const features = getLineStringFeaturesAtPixel(event, null);
    const firstFeature = features[0];

    if (firstFeature != null) {
      selectFeatures([firstFeature]);
    } else {
      clearSelection();
    }

    event.stopPropagation();
  };

  return { select };
};

export default useSelect;
