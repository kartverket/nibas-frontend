import { useEffect, useState } from "react";
import { Feature } from "ol";
import { historiskeGrenserFetcher } from "../../../api/historiskeGrenser";
import { geoJsonToSource } from "../../../utils/map/geoJson";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "../../../utils/map/source";
import { grenserLayers } from "../../../hooks/layers/constants";
import { useToolbar } from "../../../contexts/ToolbarContext";
import { useToast } from "@kvib/react";
import { FeatureCollection, FeatureProperties, Metadata } from "../../../types/api";
import { LineString } from "ol/geom";
import { useHistory } from "../../../contexts/HistoryContext/HistoryContext";
import { createNyGrenseHistoryChange } from "./grense-history-utils";
import { SplittedFeature } from "./useSplit";
import { getTempFeatureId } from "./feature-id-utils";
import { getGrensetypeFromInndelingtype } from "../../../hooks/layers/types";
import { useInndelinger } from "../../../contexts/InndelingerContext/InndelingerContext";
import { useFeatureStyle } from "../../../contexts/FeatureStyleContext/FeatureStyleContext";
import { useAuthentication } from "../../../components/Authentication/useAuthentication";
import { grenseStyles } from "../../../utils/map/layerStyles";
import { roundToNearestHalf } from "../OverlayPanels/NavigasjonPanel/koordinater-utils";
const useHistoriskeGrenser = () => {
  const [historiskeGrenserIsLoading, setHistoriskeGrenserIsLoading] = useState(false);
  const [historiskeGrenserFetched, setHistoriskeGrenserFetched] = useState(false);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const { activeTool, activeModeTools } = useToolbar();
  const toast = useToast();
  const { addHistoryEntry } = useHistory();
  const { currentlyEditingInndelinger } = useInndelinger();
  const { addHistoriskeGrenserStyles } = useFeatureStyle();
  const auth = useAuthentication();
  const getHistoriskeGrenser = async (gyldigTilDate: string) => {
    clearHistoriskeGrenser();
    setHistoriskeGrenserIsLoading(true);
    setAllFeatures([]);
    const token = auth.token;
    const inndelingstype = currentlyEditingInndelinger[0].inndelingtype;
    const inndelingsIds = currentlyEditingInndelinger
      .filter((i) => i.inndelingtype === inndelingstype)
      .map((i) => i.id);

    if (inndelingsIds.length === 0) {
      return;
    }

    const grenserFeatures = await historiskeGrenserFetcher(
      inndelingsIds,
      gyldigTilDate,
      token,
      inndelingstype === "stemmekrets" ? "stemmekrets" : "grunnkrets",
    );
    const featureCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: grenserFeatures,
    };
    const featureGeometryCollection = geoJsonToSource(featureCollection).getFeatures();
    featureGeometryCollection.forEach((feature) => {
      // Legger til en midlertidig id på featuren, så grensene ikke erstatter andre versjoner av grensa i kartet med samme id
      const newId = getTempFeatureId();
      feature.setId(newId);
      feature.setProperties({ isHistorical: true });
    });

    if (featureGeometryCollection.length > 0) {
      setAllFeatures(featureGeometryCollection);
      addHistoriskeGrenserStyles(featureGeometryCollection.map((f) => f.getId() as string));
      addFeaturesToSource("historical", featureGeometryCollection);
      setHistoriskeGrenserFetched(true);
      for (const feature of featureGeometryCollection) {
        feature.setStyle(grenseStyles.historical);
      }
    }
    if (featureGeometryCollection.length === 0) {
      toast({
        status: "warning",
        title: `Fant ingen historiske grenser den ${gyldigTilDate}`,
        description: ``,
      });
    } else {
      toast({
        status: "success",
        title: `Viser ${featureGeometryCollection.length} historiske grenser:`,
        description: ``,
      });
    }
    setHistoriskeGrenserIsLoading(false);
  };
  const resetHistoriskeGrenser = () => {
    clearHistoriskeGrenser();
    setAllFeatures([]);
    setHistoriskeGrenserFetched(false);
  };

  const gjenopprettHistoriskeGrenser = (featuresToRestore: Feature<LineString>[]) => {
    if (featuresToRestore.length === 0) {
      return;
    }
    let anyRounded = false;
    let countSaved = 0;
    featuresToRestore.forEach((featureToRestore, idx, array) => {
      // Sjekk om det er en historisk grense, hvis ikke gjør vi ingenting med den
      if (!allFeatures.some((f) => f.getId() === featureToRestore.getId())) {
        return;
      }
      const splittedFeatures: SplittedFeature[] = [];
      const properties = featureToRestore.getProperties() as FeatureProperties | undefined;
      const grenseType = getGrensetypeFromInndelingtype(currentlyEditingInndelinger[0].inndelingtype);
      if (!properties || !grenseType) {
        return;
      }

      const metadata = properties.metadata as Metadata | undefined;
      // Endre featurens gyldigTil til å være null, resten av metadata tar vi vare på
      featureToRestore.setProperties({
        ...properties,
        metadata: {
          ...metadata,
          common: {
            ...metadata?.common,
            gyldigTil: null,
          },
        },
      });
      featureToRestore.unset("isHistorical");

      // Fjerner grense fra historical-laget og legger tilbake i edit-laget
      removeFeaturesFromSourceByIds("historical", [featureToRestore.getId() as string]);
      addFeaturesToSource("edit", [featureToRestore]);
      featureToRestore.setStyle(grenseType === "STEMMEKRETS" ? grenseStyles.stemmekrets : grenseStyles.grunnkrets);
      if (currentlyEditingInndelinger.length === 0) {
        return;
      }

      // Avrunder koordinatene til nærmeste halve cm, maks 3 desimaler
      const geometry = featureToRestore != null ? featureToRestore.getGeometry() : undefined;
      if (geometry) {
        const roundedCoordinates = geometry.getCoordinates().map((coord) => {
          const rounded = [roundToNearestHalf(coord[0]), roundToNearestHalf(coord[1])];
          // Sjekk om noen koordinater ble avrundet
          if (!anyRounded && (coord[0] !== rounded[0] || coord[1] !== rounded[1])) {
            anyRounded = true;
          }
          return rounded;
        });
        geometry.setCoordinates(roundedCoordinates);
      }

      // Legger den 'gjenopprettede' grensa til history som en nygrense
      const change = createNyGrenseHistoryChange(featureToRestore, grenseType, splittedFeatures);
      if (change == null) {
        return;
      }
      addHistoryEntry({
        type: "nygrense",
        changes: [change],
      });
      countSaved++;

      // Hvis vi er på siste feature, vis toast
      if (idx === array.length - 1) {
        if (anyRounded) {
          toast({
            status: "info",
            title: "Koordinater avrundet",
            description: "Noen punkter ble avrundet til 3 desimaler.",
            duration: 5000,
          });
        }
        if (countSaved > 0) {
          toast({
            status: "success",
            title: `Gjenopprettet ${countSaved > 1 ? countSaved + " historiske grenser" : countSaved + " historisk grense"}`,
            description: `Husk å sette tilhørighet på grensene`,
            duration: 5000,
          });
        } else {
          toast({
            status: "warning",
            title: `Fant ingen historiske grenser å gjenopprette`,
            description: ``,
          });
        }
      }
    });
  };

  const clearHistoriskeGrenser = () => {
    const source = grenserLayers.historical.getSource();

    if (source) {
      source.clear();
      return true;
    }

    return false;
  };
  // Useeffect for å rydde opp i laget når komponenten fjernes
  useEffect(() => {
    if (
      activeTool !== "historiskeGrenser" &&
      activeTool !== "grenseinfo" && // (tillater bruk av grenseinfo samtidig)
      allFeatures.length > 0 &&
      !historiskeGrenserIsLoading
    ) {
      allFeatures.forEach((feature) => {
        removeFeaturesFromSourceByIds("historical", [feature.getId() as string]);
      });
      clearHistoriskeGrenser();
      setAllFeatures([]);
      setHistoriskeGrenserIsLoading(false);
      setHistoriskeGrenserFetched(false);
    }
  }, [activeTool, activeModeTools, allFeatures, historiskeGrenserIsLoading]);

  return {
    historiskeGrenserIsLoading,
    allFeatures,
    getHistoriskeGrenser,
    gjenopprettHistoriskeGrenser,
    historiskeGrenserFetched,
    resetHistoriskeGrenser,
  };
};

export default useHistoriskeGrenser;
