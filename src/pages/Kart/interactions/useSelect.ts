import { useToast } from "@kvib/react";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { Tool, useToolbar } from "contexts/ToolbarContext";
import { MapBrowserEvent } from "ol";
import {
  getFeatureFremtidigEndringDato,
  getFlateRepresentasjonpunkterWithFremtidigEndring,
  isFeatureEditable,
  isFeatureToBeArchived,
} from "utils/features";
import { removeNil } from "utils/list-utils";
import { overlayPopup } from "../constants";
import { datestringToFormattedDatestring } from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { useGetFeatures } from "./interaction-utils";

export const exclusiveSelectTools: Tool[] = ["grenseinfo", "split"];

const useSelect = () => {
  const toast = useToast();
  const { activeTool, activeModeTools } = useToolbar();
  const { selectFeatures, selectedFeatures, clearSelection, addToSelection, removeFromSelection, isSelectedFeature } =
    useFeatureStyle();
  const { closeOverlayPanel, openOverlayPanel } = useOverlayPanel();
  const { getLineStringFeaturesAtPixel } = useGetFeatures();

  const disallowedTools: Tool[] = ["draw", "koordinater"];
  const safeTools: Tool[] = ["grenseinfo"];
  const pointTools: Tool[] = ["add", "remove", "split"];

  const select = (event: MapBrowserEvent<MouseEvent>) => {
    if (
      !event.dragging &&
      !disallowedTools.includes(activeTool) &&
      !(activeModeTools.includes("move") && !safeTools.includes(activeTool))
    ) {
      const activeFeatures = getLineStringFeaturesAtPixel(event, safeTools.includes(activeTool) ? null : "edit");

      // Dersom man har klikket på kartet skal vi kvitte oss med selection
      if (activeFeatures.length === 0) {
        overlayPopup.setPosition(undefined);
        closeOverlayPanel();
        clearSelection();
        event.stopPropagation();
        return;
      }

      // Vi velger kun én feature om gangen
      const clickedFeature = activeFeatures[0];

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

      // Noen verktøy skal kun kunne velge én grense om gangen
      if (exclusiveSelectTools.includes(activeTool)) {
        selectFeatures([clickedFeature]);
      } else {
        addToSelection(clickedFeature);
      }
    }
  };

  return { select };
};

export default useSelect;
