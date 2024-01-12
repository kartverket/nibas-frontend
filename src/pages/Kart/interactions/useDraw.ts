import { useEffect, useMemo } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { noModifierKeys } from "ol/events/condition";
import { grenseStyles } from "utils/map/layerStyles";
import { editSource } from "hooks/layers/constants";
import { useEditAllGrenser } from "contexts/EditGrenserContext";
import { getGrenseTypeFromEditingType } from "hooks/layers/types";
import { useToast } from "@kvib/react";
import { Feature, MapBrowserEvent } from "ol";
import LineString from "ol/geom/LineString";
import { getInfoFromFeature, previousCoordinateKey } from "./utils";
import { HistoryChange } from "contexts/HistoryContext/types";
import { useHistory } from "contexts/HistoryContext/HistoryContext";

const useDraw = () => {
  const { activeTool } = useToolbar();
  const { getCurrentlyEditingType } = useEditAllGrenser();
  const { addHistoryEntry } = useHistory();

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
        condition: (event: MapBrowserEvent<MouseEvent>) =>
          noModifierKeys(event) &&
          (activeTool === "draw" || activeTool === "extend"),
      }),
    [activeTool],
  );

  useEffect(() => {
    const addDrawToHistory = (e: DrawEvent) => {
      const feature = e.feature;
      if (e.feature instanceof Feature) {
        const changes: HistoryChange<number[][]>[] = [];
        const geometry = feature.getGeometry();

        // Filtrerer ut representasjonspunkt og flate fra å bli satt inn i history
        if (geometry instanceof LineString) {
          const { coordinates, featureId } = getInfoFromFeature(feature);

          console.log(getInfoFromFeature(feature));
          if (!coordinates || !featureId) return;
          changes.push({
            id: featureId as string,
            from: feature.get(previousCoordinateKey),
            to: coordinates,
          });
          feature.unset(previousCoordinateKey);
        }
        console.log(changes);
        addHistoryEntry({
          type: "grense",
          changes,
        });
      }
      // TODO: hvis man har kjørt en detach vil vi kanskje sjekke om featuren nå er en løs tråd
    };

    const onDrawEnd = (e: DrawEvent) => {
      const editingType = getCurrentlyEditingType();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (!editingType) return;

      // TODO: for å kunne tegnes i kartet må en feature også ha en unik ID (tror jeg)
      e.feature.setId(
        "abc123-uuid-lmao-" + String(Math.floor(Math.random() * 1000)),
      );
      e.feature.setProperties({
        // Setter grensetypen til featuren lik typen man redigerer, kanskje naivt
        type: getGrenseTypeFromEditingType(editingType),
      });

      addDrawToHistory(e);

      toast({ status: "success", title: "Grensen ble lagt til i kartet" });

      // TODO: bruk isFeatureDeadEnd for å avgjøre om den nye grensen danner en lukket flate

      // TODO: her skal vi på sikt legge til history
      // slik at den nye grensen blir sendt til backend via utkastet
      if (activeTool === "extend") {
        //
      }

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };

    draw.on("drawend", onDrawEnd);
    return () => {
      draw.un("drawend", onDrawEnd);
    };
  }, [draw, getCurrentlyEditingType, toast, activeTool, addHistoryEntry]);

  return { draw };
};

export default useDraw;
