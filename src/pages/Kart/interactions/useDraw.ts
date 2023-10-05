import { useEffect, useMemo } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { noModifierKeys } from "ol/events/condition";
import { grenseStyles } from "utils/map/layerStyles";
import { editSource } from "hooks/layers/constants";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { getGrenseTypeFromEditingType } from "hooks/layers/types";
import { map } from "../constants";
import { LineString } from "ol/geom";
import { squaredDistance } from "ol/coordinate";
import { useToast } from "@kvib/react";
import { createSuccessToast } from "utils/components/toast";

const useDraw = () => {
  const { activePointMode } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const toast = useToast();

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const draw = useMemo(
    () =>
      new Draw({
        type: "LineString",
        source: editSource,
        snapTolerance: pixelTolerance,
        style: grenseStyles.dirty,
        freehandCondition: () => false,
        condition: (mapBrowserEvent) => {
          if (activePointMode !== "draw") return false;
          const featuresAtPixel = map.getFeaturesAtPixel(
            mapBrowserEvent.pixel,
            { hitTolerance: pixelTolerance }
          );

          const lineStringWasClicked = featuresAtPixel.some((feature) => {
            const geometry = feature.getGeometry();
            if (geometry instanceof LineString) {
              const coordinates = geometry.getCoordinates();
              // TODO: pikseltoleransen her fungerer ikke konsekvent, av og til får man tegne når man ikke skal og motsatt
              // TODO: ønsker bare å tegne fra endepunkt til endepunkt? eller skal det splittes når man tegner?
              return coordinates.some((coordinate) => {
                return (
                  squaredDistance(coordinate, mapBrowserEvent.coordinate) <
                  pixelTolerance ** 2
                );
              });
            }
          });

          return noModifierKeys(mapBrowserEvent) && lineStringWasClicked;
        },
      }),
    [activePointMode]
  );

  useEffect(() => {
    const onDrawEnd = (e: DrawEvent) => {
      const editingType = getCurrentlyEditingType();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (!editingType) return;

      // TODO: for å kunne tegnes i kartet må en feature også ha en unik ID (tror jeg)
      e.feature.setProperties({
        // Setter grensetypen til featuren lik typen man redigerer, kanskje naivt
        type: getGrenseTypeFromEditingType(editingType),
      });

      toast(createSuccessToast("Grensen ble lagt til i kartet"));

      // TODO: bruk isFeatureDeadEnd for å avgjøre om den nye grensen danner en lukket flate

      // TODO: her skal vi på sikt legge til history
      // slik at den nye grensen blir sendt til backend via utkastet

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };

    draw.on("drawend", onDrawEnd);
    return () => {
      draw.un("drawend", onDrawEnd);
    };
  }, [draw, getCurrentlyEditingType, toast]);

  return { draw };
};

export default useDraw;
