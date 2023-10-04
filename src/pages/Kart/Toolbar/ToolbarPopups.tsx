import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { getFeatureId } from "utils/map/source";
import { useToast } from "@kvib/react";
import { createSuccessToast } from "utils/components/toast";

const ToolbarPopups = () => {
  const toast = useToast();
  const { activePointMode, canArchive } = useToolbar();
  const { split } = useSplit();
  const { selectedFeatures, selectedPoint, setArchivedFeatures } =
    useFeatureStyle();

  const archiveFeatures = (features: Feature<LineString>[]) => {
    setArchivedFeatures(features.map((feature) => getFeatureId(feature)));
  };

  const handleSplit = () => {
    split();
    toast(createSuccessToast("Grensen ble splittet"));
  };

  return (
    <>
      {activePointMode === "archive" && (
        <ToolbarPopup
          text="Velg grensen du ønsker å arkivere"
          buttonText="Arkiver"
          onClick={() => archiveFeatures(selectedFeatures)}
          isDisabled={canArchive}
        />
      )}
      {activePointMode === "split" && selectedFeatures.length === 0 && (
        <ToolbarPopup text="Velg grensen du ønsker å splitte" />
      )}
      {activePointMode === "split" && selectedFeatures.length === 1 && (
        <ToolbarPopup
          text="Velg hvilket punkt du ønsker å splitte grensen på"
          buttonText="Splitt grense"
          onClick={() => handleSplit()}
          isDisabled={selectedPoint === null}
        />
      )}
    </>
  );
};
export default ToolbarPopups;
