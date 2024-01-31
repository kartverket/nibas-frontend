import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { getFeatureId } from "utils/map/source";
import { useToast } from "@kvib/react";
import { addArchivingEntryFromFeature } from "../OverlayPanels/MetadataPanel/utils";
import { useHistory } from "contexts/HistoryContext";
import { getMatrikkelFeatures } from "utils/map/layers";
import { map } from "../constants";
import { useState } from "react";
import { useErrorHandling } from "contexts/ErrorHandlingContext";

const ToolbarPopups = () => {
  const [matrikkelIsLoading, setMatrikkelIsLoading] = useState(false);
  const { setError } = useErrorHandling();
  const toast = useToast();
  const { split } = useSplit();
  const { addHistoryEntry } = useHistory();
  const { activeModeTools, activeTool, resetModeTools, resetTool } =
    useToolbar();
  const {
    selectedFeatures,
    selectedPoint,
    setArchivedFeatures,
    clearSelection,
  } = useFeatureStyle();

  const archiveFeatures = () => {
    const selectedFeature = selectedFeatures[0];
    if (selectedFeature) {
      setArchivedFeatures([getFeatureId(selectedFeature)]);
      addArchivingEntryFromFeature(selectedFeature, addHistoryEntry),
        clearSelection();
      toast({ status: "success", title: "Grensen ble arkivert" });
      toast({
        status: "warning",
        title: "Husk å sette tilhørighet på berørte grenser",
        description: `For øyeblikket må alle flatetilhørigheter på grensene legges til manuelt. 
        Husk å se gjennom og sørg for at alle tilhørighetene stemmer. 
        Er ikke de satt ordentlig vil ikke publiseringen kunne gjennomføres uten feil. 
        Tilhørigheten kan settes ved å bruke "Se og endre 
        grenseinformasjon"-verktøyet.`,
        isClosable: true,
        duration: null,
      });
    }
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({
      status: "success",
      title: "Grensen ble splittet",
    });
  };

  const handleMatrikkel = async () => {
    const zoom = map.getView().getZoom();
    if (!zoom || zoom < 15) {
      toast({
        status: "error",
        title:
          "Kartutsnittet er for stort. Zoom inn nærmere før du henter inn eiendomsgrensene",
      });
    } else {
      setMatrikkelIsLoading(true);
      const matrikkelFeatures = await getMatrikkelFeatures();
      if (matrikkelFeatures) {
        if (matrikkelFeatures.length === 10000) {
          toast({
            status: "warning",
            title:
              "Utsnittet inneholder for mange grenser. Zoom nærmere, og prøv igjen.",
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

  return (
    <>
      {activeModeTools.includes("matrikkel") && (
        <ToolbarPopup
          text="Hent og vis eiendomsgrenser fra matrikkelen"
          subtext="Grensene hentes ut basert på kartutsnittet du ser på. Flytt kartet til hvor du ønsker å hente frem eiendomsgrensene."
          buttonText="Hent grenser"
          onClick={handleMatrikkel}
          onClose={resetModeTools}
          isDisabled={matrikkelIsLoading}
          isLoading={matrikkelIsLoading}
        />
      )}
      {activeTool === "draw" && (
        <ToolbarPopup
          text="Start tegning ved å klikke på kartet"
          subtext="Tegninger kan snappes til punkter eller startes fritt utenfor andre grenser. Dobbelklikk for å avslutte tegning"
          onClose={resetTool}
        />
      )}
      {activeTool === "split" && selectedFeatures.length === 0 && (
        <ToolbarPopup
          text="Velg grensen du ønsker å splitte"
          onClose={resetTool}
        />
      )}
      {activeTool === "split" && selectedFeatures.length === 1 && (
        <ToolbarPopup
          text="Velg hvilket punkt du ønsker å splitte grensen på"
          buttonText="Splitt grense"
          onClick={() => handleSplit()}
          isDisabled={selectedPoint === null}
          onClose={resetTool}
        />
      )}
      {activeTool === "detach" && selectedFeatures.length === 0 && (
        <ToolbarPopup
          text="Velg grensen du ønsker å løsrive fra andre grenser"
          onClose={resetTool}
        />
      )}
      {activeTool === "detach" && selectedFeatures.length === 1 && (
        <ToolbarPopup
          text="Dra på et knutepunkt for å løsrive grensen"
          onClose={resetTool}
        />
      )}
      {activeTool === "metadata" && (
        <ToolbarPopup
          text="Velg en grense i kartet for å se grenseinformasjon"
          onClose={resetTool}
        />
      )}
      {activeTool === "archive" && (
        <ToolbarPopup
          text="Velg grensen du ønsker å arkivere"
          buttonText="Arkiver"
          onClick={archiveFeatures}
          isDisabled={selectedFeatures.length !== 1}
          onClose={resetTool}
        />
      )}
      {activeTool === "koordinater" && (
        <ToolbarPopup
          text="Velg et punkt på en grense for å åpne koordinatmenyen"
          onClose={resetTool}
        />
      )}
      {activeTool === "add" && (
        <ToolbarPopup
          text="Trykk på en grense for å legge til et punkt"
          onClose={resetTool}
        />
      )}
      {activeTool === "remove" && (
        <ToolbarPopup
          text="Trykk på et punkt for å fjerne punktet fra grensen"
          onClose={resetTool}
        />
      )}
    </>
  );
};
export default ToolbarPopups;
