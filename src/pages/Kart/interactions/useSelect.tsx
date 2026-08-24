import { useToast } from "@kvib/react";
import { Feature, MapBrowserEvent } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString } from "ol/geom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFeatureStyle } from "../../../contexts/FeatureStyleContext/FeatureStyleContext";
import { useOverlayPanel } from "../../../contexts/OverlayPanelContext";
import { useOverlayPopup } from "../../../contexts/OverlayPopupContext";
import { Tool, useToolbar } from "../../../contexts/ToolbarContext";
import { FeatureProperties } from "../../../types/api";
import {
  getFeatureFremtidigEndringDato,
  getFlateRepresentasjonpunkterWithFremtidigEndring,
  isFeatureEditable,
  isFeatureToBeArchived,
  isTeigFeature,
} from "../../../utils/features";
import { getUniqueItemsBy, removeNil } from "../../../utils/list-utils";
import { map } from "../constants";
import { datestringToFormattedDatestring } from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { areCoordsWithinNibasHitTolerance } from "../OverlayPanels/NavigasjonPanel/koordinater-utils";
import { SelectedFeatureList } from "../OverlayPopups/SelectedFeatureList";
import { useGetFeatures } from "./interaction-utils";
import { editSource } from "hooks/layers/constants";

export const exclusiveSelectTools: Tool[] = ["grenseinfo", "split"];
export type SelectFeature = {
  feature: Feature<LineString>;
  clicked: boolean;
};

export type SelectData = {
  coordinates: Coordinate;
  selectFeatures: SelectFeature[];
};

const useSelect = () => {
  const toast = useToast();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectFeatures, selectedFeatures, clearSelection, addToSelection, removeFromSelection, isSelectedFeature } =
    useFeatureStyle();
  const { closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const { getLineStringFeaturesAtPixel } = useGetFeatures();
  const { openOverlayPopup, closeOverlayPopup } = useOverlayPopup();

  useEffect(() => {
    if (!(activeTool === "grenseinfo")) {
      closeOverlayPopup();
    }
  }, [activeTool, closeOverlayPopup]);

  const disallowedTools: Tool[] = ["draw", "koordinater"];
  const safeTools: Tool[] = ["grenseinfo", "split", "duplicate", "historiskeGrenser", "merge_grenser", "delete"];
  const pointTools: Tool[] = ["add", "remove", "split"];

  const [prevSelectData, setPrevSelectData] = useState<SelectData>();

  const selectImpl = (event: MapBrowserEvent<PointerEvent>) => {
    if (
      !event.dragging &&
      !disallowedTools.includes(activeTool) &&
      !(activeModeTools.includes("move") && !safeTools.includes(activeTool))
    ) {
      // TODO: Burde kanskje sørge for at det ikke er to av samme administrative grense i noen tilfeller.
      const activeFeatures = getUniqueItemsBy(
        getLineStringFeaturesAtPixel(event, safeTools.includes(activeTool) ? null : ["edit"]),
        (f) => f.getId(),
      );

      const quitSelection = () => {
        setPrevSelectData(undefined);
        closeOverlayPopup();
        closeOverlayPanel();
        clearSelection();
        event.stopPropagation();
      };

      // Dersom man har klikket på kartet skal vi kvitte oss med selection
      if (activeFeatures.length === 0) {
        quitSelection();
        return;
      }
      // Dette gjør at gjentatte klikk itererer gjennom grenser som ligger på samme sted.
      let clickedFeature = activeFeatures[0];
      const currentZoomLevel = map.getView().getZoom() ?? -Infinity;
      if (activeTool === "grenseinfo" && activeFeatures.length > 1 && currentZoomLevel > 10) {
        const activeFeaturesSorted = activeFeatures.toSorted((a, b) => {
          const sortStringA = isTeigFeature(a) ? "Teiggrense" : (a.getProperties() as FeatureProperties).type;
          const sortStringB = isTeigFeature(b) ? "Teiggrense" : (b.getProperties() as FeatureProperties).type;
          return sortStringA.localeCompare(sortStringB);
        });
        const selectedActiveFeatures = activeFeaturesSorted
          .map((af) => ({
            feature: af,
            clicked: af.getId() === clickedFeature.getId(),
          }))
          .slice(0, 5);
        // Finner den første featuren i lista som ikke er valgt
        if (prevSelectData != null && areCoordsWithinNibasHitTolerance(prevSelectData.coordinates, event.coordinate)) {
          const nextClickFeature = prevSelectData.selectFeatures.find(
            (selectFeature) => !selectFeature.clicked,
          )?.feature;
          if (nextClickFeature != null) {
            clickedFeature = nextClickFeature;
            setPrevSelectData((prev) => ({
              coordinates: prev!.coordinates,
              selectFeatures: prev!.selectFeatures.map((sf) =>
                sf.feature.getId() === clickedFeature.getId() ? { feature: sf.feature, clicked: true } : sf,
              ),
            }));
          } else {
            // hvis vi har klikket oss gjennom alle er vi ferdige og kan lukke select
            quitSelection();
            return;
          }
        } else {
          setPrevSelectData({
            coordinates: event.coordinate,
            selectFeatures: selectedActiveFeatures,
          });
        }
        const clickedFeatureId = clickedFeature.getId()?.toString() ?? "";
        openOverlayPopup(
          <SelectedFeatureList
            activeFeaturesAmount={activeFeaturesSorted.length}
            selectedFeatures={selectedActiveFeatures}
            selectedFeatureId={clickedFeatureId}
          />,
          event.coordinate,
        );
      } else {
        closeOverlayPopup();
      }

      // Hvis feature allerede er valgt skal den de-selectes, men bare hvis vi ikke er i et verktøy
      // som trenger selection (split, archive)
      if (
        !pointTools.includes(activeTool) &&
        !exclusiveSelectTools.includes(activeTool) &&
        isSelectedFeature(clickedFeature)
      ) {
        removeFromSelection(clickedFeature);
        event.stopPropagation();
        return;
      }

      // I noen verktøy skal man ikke kunne velge ikke-redigerbare grenser
      if (!safeTools.includes(activeTool)) {
        const fremtidigEndringDato = getFeatureFremtidigEndringDato(clickedFeature);
        const fremtidigEndringRepresentasjonspunkter =
          getFlateRepresentasjonpunkterWithFremtidigEndring(clickedFeature);

        if (!isFeatureEditable(clickedFeature, isFeatureToBeArchived(clickedFeature))) {
          toast({ status: "error", title: "Denne grensen er ikke redigerbar" });
          event.stopPropagation();
          return;
        } else if (fremtidigEndringDato != null) {
          toast({
            status: "error",
            title: "Grensen du har valgt er ikke redigerbar",
            description: `Grensen har en fremtidig endring og kan ikke endres før den nye endringen har inntruffet. Endringen skal inntreffe ${datestringToFormattedDatestring(fremtidigEndringDato)}`,
          });
          event.stopPropagation();
          return;
        } else if (fremtidigEndringRepresentasjonspunkter.length > 0) {
          const punkterByDate = removeNil(
            fremtidigEndringRepresentasjonspunkter
              .map((punkt) => {
                const name = punkt.get("name") as string | undefined;
                const gyldigTil = punkt.get("gyldigTil") as string | undefined;

                if (name != null && gyldigTil != null) {
                  return {
                    name,
                    gyldigTil,
                  };
                }
              })
              .sort((a, b) => {
                const dateOne = a?.gyldigTil;
                const dateTwo = b?.gyldigTil;

                if (dateOne != null && dateTwo != null) {
                  return dateOne.localeCompare(dateTwo);
                }

                return 0;
              }),
          );

          const sisteEndring = punkterByDate[punkterByDate.length - 1];

          toast({
            status: "error",
            title: "Grensen du har valgt er ikke redigerbar",
            description: `En eller flere av flatene grensen er tilknyttet har en fremtidig endring og grensen kan dermed ikke endres før alle endringer har inntruffet. Siste endring gjelder ${sisteEndring.name} og skal inntreffe ${datestringToFormattedDatestring(sisteEndring.gyldigTil)}`,
          });
          event.stopPropagation();
          return;
        }
      }

      if (activeTool === "split") {
        // Dersom featuren vi vil splitte er for liten skal vi ikke velge den
        const geometry = clickedFeature.getGeometry();
        const coordinates = geometry?.getCoordinates() ?? [];
        if (coordinates.length <= 2) {
          toast({
            status: "error",
            title: "Grensen har for få punkter til å deles",
          });
          event.stopPropagation();
          return;
        }

        // Dersom vi er i split-modus og allerede har valgt denne grensen
        if (selectedFeatures.length === 1 && clickedFeature.getId() === selectedFeatures[0].getId()) {
          // ...ønsker vi å returnere tidlig og la eventet propagere til selectPoint
          return;
        }
      }

      if (activeTool === "grenseinfo") {
        openOverlayPanel("grenseinfo");
      }

      if (activeTool === "archive" && isFeatureToBeArchived(clickedFeature) === true) {
        toast({
          status: "error",
          title: "Kan ikke arkivere grenser som allerede er arkivert",
        });
        event.stopPropagation();
        return;
      }

      const clickedFeatureId = clickedFeature.getId();
      if (
        activeTool === "duplicate" &&
        clickedFeatureId != null &&
        editSource.getFeatureById(clickedFeatureId) != null
      ) {
        toast({
          status: "error",
          title: isFeatureEditable(clickedFeature)
            ? "Du kan ikke duplisere grenser som allerede er redigerbare"
            : "Denne grensen er ikke redigerbar",
        });
        event.stopPropagation();
        return;
      }

      if (activeTool === "merge_grenser" && !isFeatureEditable(clickedFeature)) {
        toast({
          status: "error",
          title: "Du kan ikke slå sammen grenser som ikke er redigerbare",
        });
        event.stopPropagation();
        return;
      }

      // Noen verktøy skal kun kunne velge én grense om gangen
      if (exclusiveSelectTools.includes(activeTool)) {
        selectFeatures([clickedFeature]);
      } else {
        addToSelection(clickedFeature);
      }
    }
  };

  // Holder en ref til select slik at vi kan oppdatere uavhengig av selve callbacken.
  const selectImplRef = useRef(selectImpl);
  selectImplRef.current = selectImpl;
  const select = useCallback((event: MapBrowserEvent<PointerEvent>) => {
    selectImplRef.current(event);
  }, []);

  return { select };
};

export default useSelect;
