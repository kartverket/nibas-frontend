import { useToolbar } from "contexts/ToolbarContext";
import ToolbarPopup from "./ToolbarPopup";
import { Feature } from "ol";
import { LineString } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext";
import useSplit from "../interactions/useSplit";
import { addFeaturesToSource, getFeatureId } from "utils/map/source";
import { useToast } from "@kvib/react";
import { getLayerById, useMatrikkelFeatures } from "utils/map/layers";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";

const ToolbarPopups = () => {
  const toast = useToast();
  const { activeEditModes, activePointMode, canArchive } = useToolbar();
  const { split } = useSplit();
  const {
    selectedFeatures,
    selectedPoint,
    setArchivedFeatures,
    clearSelection,
  } = useFeatureStyle();
  const {
    trigger: triggerMatrikkelFetch,
    isMutating,
    error,
    data: matrikkelResponse,
  } = useMatrikkelFeatures();

  const archiveFeatures = (features: Feature<LineString>[]) => {
    setArchivedFeatures(features.map((feature) => getFeatureId(feature)));
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({ status: "success", title: "Grensen ble splittet" });
  };

  const handleMatrikkelFeatures = async () => {
    console.log("Skal prøve å hente noe");
    triggerMatrikkelFetch();

    if (error) {
      console.log("error?", error);
    }

    if (matrikkelResponse) {
      console.log("fikk en response", matrikkelResponse);
      const json = await matrikkelResponse.text();
      const fetchedFeatures = getFeaturesFromGeoJson(json);
      console.log("Antall features:", fetchedFeatures.length);

      if (!fetchedFeatures) return null;
      const source = getLayerById("matrikkel").getSource();
      if (source) {
        source.clear(true);
      }
      addFeaturesToSource("matrikkel", fetchedFeatures);
    }
  };

  return (
    <>
      {activeEditModes.includes("matrikkel") && (
        <ToolbarPopup
          text="Bruk knappen til å hente grenser innenfor skjermen"
          buttonText="Hent grenser"
          onClick={handleMatrikkelFeatures}
          isDisabled={isMutating}
        />
      )}
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
