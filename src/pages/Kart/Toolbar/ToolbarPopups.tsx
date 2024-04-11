import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { useToast } from "@kvib/react";
import { addArchivingEntryFromFeatureList } from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { clearMatrikkelLayer, getMatrikkelFeatures } from "utils/map/layers";
import { map } from "../constants";
import { useState } from "react";
import { useErrorHandling } from "contexts/ErrorHandlingContext";
import { removeNil } from "utils/list-utils";

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
            "En ukjent feil skjedde ved henting av grenser fra matrikkelen. Vennligst forsøk igjen, om problemet fortsetter er det fint om du tar kontakt med Kartverket.",
        });
      }
      setMatrikkelIsLoading(false);
    }
  };

  const handleClearMatrikkel = () => {
    if (clearMatrikkelLayer())
      toast({
        status: "success",
        title: "Teiggrensene ble fjernet fra kartet",
      });
  };

  return (
    <>
      {activeModeTools.includes("matrikkel") && (
        <ToolbarPopup
          text="Hent og vis eiendomsgrenser fra matrikkelen"
          subtext="Grensene hentes ut basert på kartutsnittet du ser på. Flytt kartet til hvor du ønsker å hente frem eiendomsgrensene."
          buttonText="Hent grenser"
          secondaryButtonText="Nullstill"
          onClick={handleMatrikkel}
          secondaryOnClick={handleClearMatrikkel}
          onClose={resetModeTools}
          isDisabled={matrikkelIsLoading}
          isLoading={matrikkelIsLoading}
        />
      )}
      {!activeModeTools.includes("move") && activeTool == null && (
        <ToolbarPopup
          text={
            selectedFeatures.length === 0
              ? "Velg én eller flere grenser du ønsker å flytte"
              : `Flytt eller løsriv punkt på ${selectedFeatures.length === 1 ? "den valgte grensen" : "de valgte grensene"}`
          }
        />
      )}
      {activeTool === "draw" && (
        <ToolbarPopup
          text="Start tegning ved å klikke på kartet"
          subtext="Tegninger kan snappes til punkter eller startes fritt utenfor andre grenser. Dobbelklikk for å avslutte tegning. Ønsker du å panorere underveis, bruk piltastene."
          onClose={resetTool}
        />
      )}
      {activeTool === "split" && (
        <>
          {selectedFeatures.length === 0 && <ToolbarPopup text="Velg grensen du ønsker å dele" onClose={resetTool} />}
          {selectedFeatures.length === 1 && (
            <ToolbarPopup
              text="Velg hvilket punkt du ønsker å dele grensen på"
              buttonText="Del grense"
              onClick={() => handleSplit()}
              isDisabled={selectedPoint == null}
              onClose={resetTool}
            />
          )}
        </>
      )}
      {activeTool === "grenseinfo" && (
        <ToolbarPopup text="Velg en grense i kartet for å se grenseinformasjon" onClose={resetTool} />
      )}
      {activeTool === "archive" && (
        <ToolbarPopup
          text="Velg en eller flere grenser du ønsker å arkivere"
          buttonText="Arkiver"
          onClick={archiveFeatures}
          isDisabled={selectedFeatures.length === 0}
          onClose={resetTool}
        />
      )}
      {activeTool === "koordinater" && (
        <ToolbarPopup text="Velg et punkt på en grense for å åpne koordinatmenyen" onClose={resetTool} />
      )}
      {activeTool === "add" && (
        <ToolbarPopup
          text={
            selectedFeatures.length === 0
              ? "Velg én eller flere grenser du ønsker å legge til punkt på"
              : "Trykk på en grense for å legge til et punkt"
          }
          onClose={resetTool}
        />
      )}
      {activeTool === "remove" && (
        <ToolbarPopup
          text={
            selectedFeatures.length === 0
              ? "Velg én eller flere grenser du ønsker å fjerne punkt fra"
              : "Trykk på et punkt for fjerne punktet fra grensen"
          }
          onClose={resetTool}
        />
      )}
    </>
  );
};
export default ToolbarPopups;
