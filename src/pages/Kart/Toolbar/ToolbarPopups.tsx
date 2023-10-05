import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { getFeatureId } from "utils/map/source";
import { useToast } from "@kvib/react";

const ToolbarPopups = () => {
  const toast = useToast();
  const { activePointMode, canArchive } = useToolbar();
  const { split } = useSplit();
  const {
    selectedFeatures,
    selectedPoint,
    setArchivedFeatures,
    clearSelection,
  } = useFeatureStyle();

  const archiveFeatures = (features: Feature<LineString>[]) => {
    setArchivedFeatures(features.map((feature) => getFeatureId(feature)));
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({ status: "success", title: "Grensen ble splittet" });
  };

  return (
    <>
      {activePointMode === "draw" && (
        <ToolbarPopup text="Start tegningen i et punkt og dobbeltklikk for å avslutte tegning" />
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
      {activePointMode === "detach" && selectedFeatures.length === 0 && (
        <ToolbarPopup text="Velg grensen du ønsker å løsrive fra andre grenser" />
      )}
      {activePointMode === "detach" && selectedFeatures.length === 1 && (
        <ToolbarPopup text="Dra på et knutepunkt for å løsrive grensen" />
      )}
      {activePointMode === "metadata" && (
        <ToolbarPopup text="Velg en grense i kartet for å se grenseinformasjon" />
      )}
      {activePointMode === "archive" && (
        <ToolbarPopup
          text="Velg grensen du ønsker å arkivere"
          buttonText="Arkiver"
          onClick={() => archiveFeatures(selectedFeatures)}
          isDisabled={canArchive}
        />
      )}
      {activePointMode === "koordinater" && (
        <ToolbarPopup text="Velg et punkt på en grense for å åpne koordinatmenyen" />
      )}
      {activePointMode === "add" && (
        <ToolbarPopup text="Trykk på en grense for å legge til et punkt" />
      )}
      {activePointMode === "remove" && (
        <ToolbarPopup text="Trykk på et punkt for å fjerne punktet fra grensen" />
      )}
    </>
  );
};
export default ToolbarPopups;
