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
import { map } from "../constants";

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
  const { trigger: triggerMatrikkelFetch, isMutating } = useMatrikkelFeatures();

  const archiveFeatures = (features: Feature<LineString>[]) => {
    setArchivedFeatures(features.map((feature) => getFeatureId(feature)));
  };

  const handleSplit = () => {
    split();
    clearSelection();
    toast({ status: "success", title: "Grensen ble splittet" });
  };

  const handleMatrikkelFeatures = async () => {
    const zoom = map.getView().getZoom();

    if (zoom && zoom > 10) {
      const response = await triggerMatrikkelFetch();
      if (!response.ok) throw new Error("Feil i response: " + response);

      const json = await response.text();
      const fetchedFeatures = getFeaturesFromGeoJson(json);
      if (fetchedFeatures) {
        const source = getLayerById("matrikkel").getSource();
        if (source) {
          source.clear(true);
        }
        addFeaturesToSource("matrikkel", fetchedFeatures);
        toast({
          status: "success",
          title: `Hentet ${fetchedFeatures.length} grenser fra matrikkelen`,
        });
      }
    } else {
      toast({ status: "error", title: "Du er zoomet for langt ut" });
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
