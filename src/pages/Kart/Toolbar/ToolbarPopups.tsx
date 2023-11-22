import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { getFeatureId } from "utils/map/source";
import { useToast } from "@kvib/react";
import { addArchivingEntryFromFeature } from "../OverlayPanels/MetadataPanel/utils";
import { useHistory } from "contexts/HistoryContext";

const ToolbarPopups = () => {
  const toast = useToast();
  const { activePointMode } = useToolbar();
  const { split } = useSplit();
  const {
    selectedFeatures,
    selectedPoint,
    archivedFeatureIds,
    setArchivedFeatures,
    clearSelection,
  } = useFeatureStyle();
  const { addHistoryEntry } = useHistory();

  const archiveFeatures = () => {
    const selectedFeature = selectedFeatures[0];
    if (selectedFeature) {
      setArchivedFeatures([getFeatureId(selectedFeature)]);
      addArchivingEntryFromFeature(selectedFeature, addHistoryEntry),
        clearSelection();
      toast({ status: "success", title: "Grensen ble arkivert" });
    }
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({ status: "success", title: "Grensen ble splittet" });
  };

  // TODO: denne lar meg arkivere grenser som allerede er arkiverte dersom jeg har lagret arkiveringen
  const canArchive =
    selectedFeatures.length === 0 ||
    archivedFeatureIds.some((id) => id === selectedFeatures[0].getId());

  return (
    <>
      {activePointMode === "draw" && (
        <ToolbarPopup text="Dobbeltklikk for å avslutte tegningen" />
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
          onClick={archiveFeatures}
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
