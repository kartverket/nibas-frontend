import { useEffect, useMemo, useState, useRef } from "react";
import Draw, { DrawEvent } from "ol/interaction/Draw";
import { pixelTolerance } from "./constants";
import { ModeTool, Tool, useToolbar } from "contexts/ToolbarContext";
import { noModifierKeys } from "ol/events/condition";
import { grenseStyles } from "utils/map/layerStyles";
import { getGrensetypeFromInndelingtype } from "hooks/layers/types";
import { useToast } from "@kvib/react";
import { Feature, MapBrowserEvent } from "ol";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { getTempFeatureId } from "./feature-id-utils";
import { createNyGrenseHistoryChange } from "./grense-history-utils";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import LineString from "ol/geom/LineString";
import { useGetFeatures } from "./interaction-utils";
import { equals } from "ol/coordinate";
import { getFeatureFremtidigEndringDato, setDefaultFeatureProperties } from "utils/features";
import useSplit, { SplittedFeature } from "./useSplit";
import { useConfirmationModal } from "contexts/ConfirmationModalContext";
import { Geometry } from "ol/geom";
import { findNearbyVertexOnFeature } from "utils/map/map-utils";
import useToastUnique from "hooks/toast/useToastUnique";
import { addFeaturesToSource } from "utils/map/source";
import { editSource } from "hooks/layers/constants";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { datestringToFormattedDatestring } from "../OverlayPanels/GrenseinformasjonPanel/grenseinformasjon-utils";
import { map } from "../constants";
import { CollectionEvent } from "ol/Collection";
import { Interaction } from "ol/interaction";
const useDraw = () => {
  const { activeTool, activeModeTools, toggleTool } = useToolbar();
  const { currentlyEditingInndelinger } = useInndelinger();
  const { addHistoryEntry } = useHistory();
  const { selectFeatures, selectedFeatures } = useFeatureStyle();
  const { getLineStringFeaturesAtPixel } = useGetFeatures();
  const toast = useToast();
  const { createNewFeatures, archiveOldFeature } = useSplit();
  const { openAsync } = useConfirmationModal();

  const [abortDrawMemoHelper, setAbortDrawMemoHelper] = useState(0);

  const { toastUnique: endpointToast } = useToastUnique({
    status: "warning",
    description: "Valgt punkt er ikke et endepunkt og vil resultere i en grensedeling ved avsluttet tegning",
  });

  const activeToolRef = useRef<Tool | null>(null);
  const activeModeToolsRef = useRef<ModeTool[]>([]);
  const getLineStringFeaturesAtPixelRef = useRef(getLineStringFeaturesAtPixel);
  const endpointToastRef = useRef(endpointToast);
  const toastRef = useRef(toast);
  // Når vi ikke avslutter/instansierer ny draw ved snap-toggling så blir det flere draw-instanser, fjerner derfor den/de som ikke er nyest.
  useEffect(() => {
    // Lytt på `map.getInteractions()` sin "add" event, for å oppdage når en ny Draw dukker opp
    const interactions = map.getInteractions();
    function handleAdd(evt: CollectionEvent<Interaction>) {
      if (evt.element instanceof Draw) {
        const draws = interactions.getArray().filter((i) => i instanceof Draw);
        if (draws.length > 1) {
          draws.slice(0, -1).forEach((d) => {
            map.removeInteraction(d);
          });
        }
      }
    }
    interactions.on("add", handleAdd);
    return () => {
      interactions.un("add", handleAdd);
    };
  }, []);
  // Før lå disse i dependency-arrayet til `draw`-instansieringen (f.eks. `activeTool`, `toast` osv.),
  // noe som gjorde at `draw` ble re-instansiert hver gang en av disse endret seg.
  // Det førte til at pågående tegninger ble avbrutt unødvendig (f.eks. ved hver toast).
  // Ved å bruke refs unngår vi å ha dem i dependency-lista for `draw`, og dermed beholdes den samme
  // `draw`-instansen gjennom hele tegningen.
  useEffect(() => {
    // Oppdatér alle refs i én smell
    activeToolRef.current = activeTool;
    activeModeToolsRef.current = activeModeTools;
    getLineStringFeaturesAtPixelRef.current = getLineStringFeaturesAtPixel;
    endpointToastRef.current = endpointToast;
    toastRef.current = toast;
  }, [activeTool, activeModeTools, getLineStringFeaturesAtPixel, endpointToast, toast]);

  // TODO: fungerer ikke uten snap, vet ikke hvorfor
  const draw = useMemo(() => {
    // Denne er kun her for å få ESLint til å ikke ønske å legge til en regel-ignorering, da det ikke går an å legge til
    // ignoreringer for spesifikke dependencies i dependency arrayet.
    // It ain't clean, but it works.
    abortDrawMemoHelper;
    return new Draw({
      type: "LineString",
      snapTolerance: pixelTolerance,
      style: grenseStyles.select,
      freehandCondition: () => false,
      condition: (event: MapBrowserEvent<MouseEvent>) => {
        // Hent nåværende verdi fra ref
        const currentTool = activeToolRef.current;
        const currentModeTools = activeModeToolsRef.current;
        if (!noModifierKeys(event) || currentTool !== "draw" || currentModeTools.includes("move")) {
          return false;
        }
        const featuresAtPixel = getLineStringFeaturesAtPixelRef.current(event, "edit");
        // Legg til feature hvis vi ikke treffer noen andre features
        if (featuresAtPixel.length === 0) {
          draw.changed();
          return true;
        }

        // Tror egentlig ikke det er nødvendig å sjekke alle features her, da vi vet at om man treffer et punkt på én så treffer man det samme punktet på andre
        // samtidig så er dette en særdeles lav performance kost (treffer sjelden mange features), og det er kanskje safere å helgardere oss
        for (const feature of featuresAtPixel) {
          const geometry = feature.getGeometry();

          if (geometry instanceof LineString) {
            const nearbyVertex = findNearbyVertexOnFeature(geometry, event.coordinate);

            if (nearbyVertex == null) {
              toastRef.current({
                status: "warning",
                title: "Punkter kan kun plasseres fritt eller på andre punkter",
              });
              return false;
            }

            const firstCoordinate = geometry.getFirstCoordinate();
            const lastCoordinate = geometry.getLastCoordinate();

            const isClickedPointEndPoint = [firstCoordinate, lastCoordinate].some((endpoint) =>
              equals(endpoint, event.coordinate),
            );

            if (!isClickedPointEndPoint) {
              const gyldigTilDato = getFeatureFremtidigEndringDato(feature);

              if (gyldigTilDato != null) {
                toastRef.current({
                  status: "error",
                  title: `Grensen har en fremtidig endring og kan ikke endres før den nye endringen har inntruffet. Endringen skal inntreffe ${datestringToFormattedDatestring(gyldigTilDato)}`,
                });
                return false;
              }
              endpointToastRef.current();
            }
          }
        }
        // Vi ønsker å avslutte tegningen hvis man har startet en tegning, og så treffer et punkt, så vi unngår rar geometri
        // Dette gjøres ved å bumpe et versjonstall med draw.changed() hvis denne conditionen returnerer true. Hvis versjonen da er høyere
        // enn null (som den blir av første endring), vil vi avslutte tegningen
        if (draw.getRevision() > 0) {
          draw.appendCoordinates([event.coordinate]);
          draw.finishDrawing();
          setAbortDrawMemoHelper((a) => a + 1);
          return false;
        }

        draw.changed();
        return true;
      },
    });
  }, [abortDrawMemoHelper]);

  useEffect(() => {
    const addDrawToHistory = (drawnFeature: Feature<LineString>, splittedFeatures: SplittedFeature[]) => {
      if (currentlyEditingInndelinger.length === 0) {
        return;
      }

      // Kan kun redigere én inndelingstype om gangen, så velger bare første
      const grenseType = getGrensetypeFromInndelingtype(currentlyEditingInndelinger[0].inndelingtype);

      if (grenseType) {
        const change = createNyGrenseHistoryChange(drawnFeature, grenseType, splittedFeatures);

        if (change == null) {
          return;
        }

        addHistoryEntry({
          type: "nygrense",
          changes: [change],
        });
      }
    };

    const onDrawAbort = () => {
      // Ønsket her er egentlig å sette draw.revision_ til 0. Beklageligvis gir ikke OL noen måte å resette en revision på.
      // Av den grunn så har vi lagt inn en hjelper som re-memoiserer draw, sånn at vi kan tilbakestille revision til 0.
      // Antakeligvis hadde det vært mer hensiktsmessig å finne en god måte å vurdere om man tegner på som ikke er revision, men dette funker.
      // Jeg har brukt masse timer på å finne en god løsning for aktiv tegning vs. inaktiv tegning allerede, og det er tilsynelatende ikke helt trivielt

      // PS: Det virker som at drawEnd kun resetter revision siden vi legger til i history, som gjør at hele useDraw blir kalt på nytt, og dermed revision tilbakestilt.
      // Alltid en mulighet på at dette er noe som kan brekke i fremtiden, og vi bør sikkert revurdere approachen her generelt.
      setAbortDrawMemoHelper((a) => a + 1);
    };

    const getUniqueFeaturesToSplitIfExists = (drawnFeatureGeometry: LineString) => {
      const drawnFeatureHead = drawnFeatureGeometry.getFirstCoordinate();
      const drawnFeatureTail = drawnFeatureGeometry.getLastCoordinate();

      const featuresAtHead = editSource.getFeaturesAtCoordinate(drawnFeatureHead);
      const featuresAtTail = editSource.getFeaturesAtCoordinate(drawnFeatureTail);

      // Hvis det er akkurat én feature på koordinatet til halen/hodet til den nye featuren, så betyr det at koordinatet treffer et punkt som ikke er endepunkt
      const featuresToBeSplit: Feature<Geometry>[] = [];
      if (featuresAtHead.length === 1) {
        featuresToBeSplit.push(featuresAtHead[0]);
      }
      if (featuresAtTail.length === 1) {
        featuresToBeSplit.push(featuresAtTail[0]);
      }

      return featuresToBeSplit.filter(
        (feature, index, allFeatures) => allFeatures.map((f) => f.getId()).indexOf(feature.getId()) === index,
      );
    };

    const splitFeatureAtDrawnFeatureEndpoints = (feature: Feature<Geometry>, drawnFeatureGeometry: LineString) => {
      const drawnFeatureHead = drawnFeatureGeometry.getFirstCoordinate();
      const drawnFeatureTail = drawnFeatureGeometry.getLastCoordinate();
      const geometry = feature.getGeometry();

      if (geometry && geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        const head = geometry.getFirstCoordinate();
        const tail = geometry.getLastCoordinate();

        const coordinatesToSplitAt = [drawnFeatureHead, drawnFeatureTail].filter((coordinate) => {
          if (!equals(coordinate, head) && !equals(coordinate, tail)) {
            return coordinates.some((toBeSplitCoordinate) => equals(toBeSplitCoordinate, coordinate));
          }
        });

        if (coordinatesToSplitAt.length > 0) {
          const features = createNewFeatures(feature, coordinatesToSplitAt);
          if (features != null) {
            addFeaturesToSource("edit", features.newFeatures);
            archiveOldFeature(features.oldFeature);
            return features;
          }
        }
      }
      return null;
    };
    const onDrawEnd = async (e: DrawEvent) => {
      const drawnFeature = e.feature as Feature<LineString>;
      const drawnFeatureGeometry = drawnFeature.getGeometry();

      // Skal ikke være mulig da tegneverktøyet bare skal være tilgjengelig i redigering
      if (
        currentlyEditingInndelinger.length === 0 ||
        !drawnFeatureGeometry ||
        drawnFeatureGeometry.getLength() === 0 ||
        drawnFeatureGeometry.getCoordinates().length < 2
      ) {
        setAbortDrawMemoHelper((a) => a + 1);
        return;
      }

      const newId = getTempFeatureId();
      drawnFeature.setId(newId);

      const uniqueFeaturesToBeSplit = getUniqueFeaturesToSplitIfExists(drawnFeatureGeometry);

      const splittedFeatures: SplittedFeature[] = [];
      for (const feature of uniqueFeaturesToBeSplit) {
        const features = splitFeatureAtDrawnFeatureEndpoints(feature, drawnFeatureGeometry);
        if (features != null) {
          splittedFeatures.push(features);
        }
      }

      setDefaultFeatureProperties(
        drawnFeature,
        getGrensetypeFromInndelingtype(currentlyEditingInndelinger[0].inndelingtype),
      );

      addDrawToHistory(drawnFeature, splittedFeatures);
      addFeaturesToSource("edit", [drawnFeature]);

      toast({
        status: "success",
        title: "Grensen ble lagt til i kartet",
        description: "Grense lagt til med standardmetadata. Husk at du må sette tilhørighet på nye grenser.",
      });

      selectFeatures([drawnFeature]);

      // TODO: dersom man ønsker å utvide en grense ønsker vi nok å slå sammen den nye grensen med den gamle her
      // i så fall må vi holde styr på hvilken grense som skal utvides, og fra hvilket punkt. selectPoint kan være nyttig her
    };
    draw.on("drawend", onDrawEnd);
    draw.on("drawabort", onDrawAbort);
    return () => {
      draw.un("drawend", onDrawEnd);
      draw.un("drawabort", onDrawAbort);
    };
  }, [
    addHistoryEntry,
    archiveOldFeature,
    createNewFeatures,
    currentlyEditingInndelinger,
    draw,
    openAsync,
    selectFeatures,
    selectedFeatures,
    toast,
    toggleTool,
  ]);

  return { draw };
};

export default useDraw;
