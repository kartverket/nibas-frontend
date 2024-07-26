import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { useToast } from "@kvib/react";
import {
  addArchivingEntryFromFeatureList,
  addGrenseDeleteEntryFromFeatureList,
} from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import { map } from "../constants";
import { useState } from "react";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { removeNil } from "utils/list-utils";
import { anyFeatureIsEditable } from "utils/features";
import { isTempFeatureId } from "../interactions/feature-id-utils";

const ToolbarPopups = () => {
  const [matrikkelIsLoading, setMatrikkelIsLoading] = useState(false);
  const { setError } = useErrorHandling();
  const toast = useToast();
  const { split } = useSplit();
  const { addHistoryEntry } = useHistory();
  const { activeModeTools, activeTool, resetModeTools, resetTool } = useToolbar();
  const { selectedFeatures, selectedPoint, addArchivedStyles, clearSelection } = useFeatureStyle();

  const archiveFeatures = () => {
    const selectedFeatureIds = removeNil(selectedFeatures.map((feature) => feature.getId()?.toString()));

    clearSelection();
    addArchivedStyles(selectedFeatureIds);
    removeFeaturesFromSourceByIds("edit", selectedFeatureIds);
    addFeaturesToSource("archived", selectedFeatures);

    addArchivingEntryFromFeatureList(selectedFeatures, addHistoryEntry);

    toast({
      status: "success",
      title: `${selectedFeatureIds.length} grense${selectedFeatureIds.length > 1 ? "r" : ""} ble arkivert`,
      description: "Husk å eventuelt sette tilhørighet på berørte grenser",
    });
  };

  const deleteFeatures = () => {
    const selectedFeatureIds = removeNil(selectedFeatures.map((feature) => feature.getId()?.toString()));

    const selectedFeaturesContainsExistingGrenser = !selectedFeatureIds.every((id) => isTempFeatureId(id));

    if (selectedFeaturesContainsExistingGrenser) {
      toast({
        status: "error",
        title: "Kan ikke slette eksisterende grenser",
        description: "Ønsker du å fjerne en eksisterende grense må du bruke arkivering",
      });
      return;
    }

    clearSelection();
    removeFeaturesFromSourceByIds("edit", selectedFeatureIds);

    addGrenseDeleteEntryFromFeatureList(selectedFeatures, addHistoryEntry);

    toast({
      status: "success",
      title: `${selectedFeatureIds.length} grense${selectedFeatureIds.length > 1 ? "r" : ""} ble slettet`,
    });
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({
      status: "success",
      title: "Grensen ble delt",
    });
  };

  const handleMatrikkel = async () => {
    const zoom = map.getView().getZoom();
    if (zoom == null || zoom < 15) {
      toast({
        status: "error",
        title: "Kartutsnittet er for stort. Zoom inn nærmere før du henter inn eiendomsgrensene",
      });
    } else {
      setMatrikkelIsLoading(true);
      const matrikkelFeatures = await getMatrikkelFeatures();
      if (matrikkelFeatures) {
        if (matrikkelFeatures.length === 10000) {
          toast({
            status: "warning",
            title: "Utsnittet inneholder for mange grenser. Zoom nærmere, og prøv igjen.",
          });
        } else {
          toast({
            status: "success",
            title: `${matrikkelFeatures.length} grenser ble hentet og vises nå i kartet`,
          });
        }
      } else {
        setError({
          title: "Feil ved henting av grenser fra matrikkelen",
          description:
            "En ukjent feil skjedde ved henting av grenser fra matrikkelen. Hvis feilen vedvarer, vennligst kontakt Kartverket.",
        });
      }
      setMatrikkelIsLoading(false);
    }
  };

  const handleClearMatrikkel = () => {
    if (clearMatrikkelLayer()) {
      toast({
        status: "success",
        title: "Teiggrensene ble fjernet fra kartet",
      });
    }
  };

  const getActiveToolPopup = () => {
    switch (activeTool) {
      case null:
        if (!activeModeTools.includes("move") && anyFeatureIsEditable()) {
          return (
            <ToolbarPopup
              text={
                selectedFeatures.length === 0
                  ? "Velg én eller flere grenser du ønsker å flytte"
                  : `Flytt punkt på ${selectedFeatures.length === 1 ? "den valgte grensen" : "de valgte grensene"}`
              }
            />
          );
        }
        break;

      case "draw":
        return (
          <ToolbarPopup
            text="Start tegning ved å klikke på kartet"
            subtext="Tegninger kan snappes til punkter eller startes fritt utenfor andre grenser. Dobbelklikk for å avslutte tegning. Ønsker du å panorere underveis, bruk piltastene."
            onClose={resetTool}
          />
        );

      case "split":
        if (selectedFeatures.length === 0) {
          return <ToolbarPopup text="Velg grensen du ønsker å dele" onClose={resetTool} />;
        }
        if (selectedFeatures.length === 1) {
          return (
            <ToolbarPopup
              text="Velg hvilket punkt du ønsker å dele grensen på"
              buttonText="Del grense"
              onClick={() => handleSplit()}
              isDisabled={selectedPoint == null}
              onClose={resetTool}
            />
          );
        }
        break;

      case "grenseinfo":
        return <ToolbarPopup text="Velg en grense i kartet for å se grenseinformasjon" onClose={resetTool} />;

      case "archive":
        return (
          <ToolbarPopup
            text="Velg en eller flere grenser du ønsker å arkivere"
            buttonText="Arkiver"
            onClick={archiveFeatures}
            isDisabled={selectedFeatures.length === 0}
            onClose={resetTool}
          />
        );

      case "delete":
        return (
          <ToolbarPopup
            text="Velg en eller flere grenser du ønsker å slette"
            buttonText="Slett"
            onClick={deleteFeatures}
            isDisabled={selectedFeatures.length === 0}
            onClose={resetTool}
          />
        );

      case "koordinater":
        return <ToolbarPopup text="Velg et punkt på en grense for å åpne koordinatmenyen" onClose={resetTool} />;

      case "add":
        return (
          <ToolbarPopup
            text={
              selectedFeatures.length === 0
                ? "Velg én eller flere grenser du ønsker å legge til punkt på"
                : "Trykk på en grense for å legge til et punkt"
            }
            onClose={resetTool}
          />
        );

      case "remove":
        return (
          <ToolbarPopup
            text={
              selectedFeatures.length === 0
                ? "Velg én eller flere grenser du ønsker å fjerne punkt fra"
                : "Trykk på et punkt for fjerne punktet fra grensen"
            }
            onClose={resetTool}
          />
        );
      default:
        break;
    }
  };

  return (
    <>
      {activeModeTools.includes("matrikkel") && (
        <ToolbarPopup
          text="Hent og vis eiendomsgrenser fra matrikkelen"
          subtext="Grensene hentes ut basert på kartutsnittet du ser på."
          buttonText="Hent grenser"
          secondaryButtonText="Nullstill"
          onClick={handleMatrikkel}
          secondaryOnClick={handleClearMatrikkel}
          onClose={resetModeTools}
          isDisabled={matrikkelIsLoading}
          isLoading={matrikkelIsLoading}
        />
      )}
      {getActiveToolPopup()}
    </>
  );
};
export default ToolbarPopups;
