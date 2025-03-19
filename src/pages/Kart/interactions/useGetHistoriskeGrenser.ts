import { useEffect, useState } from "react";
import { Feature } from "ol";
import { historiskeGrenserFetcher } from "../../../api/historiskeGrenser";
import { geoJsonToSource } from "../../../utils/map/geoJson";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "../../../utils/map/source";
import { grenserLayers } from "../../../hooks/layers/constants";
import { useToolbar } from "../../../contexts/ToolbarContext";
import { useToast } from "@kvib/react";
import { FeatureProperties, Metadata } from "../../../types/api";
import { LineString } from "ol/geom";
import { useHistory } from "../../../contexts/HistoryContext/HistoryContext";
import { createNyGrenseHistoryChange } from "./grense-history-utils";
import { SplittedFeature } from "./useSplit";
import { getTempFeatureId } from "./feature-id-utils";
import { getGrensetypeFromInndelingtype } from "hooks/layers/types";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { grenseStyles } from "utils/map/layerStyles";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
const useGetHistoriskeGrenser = () => {
  const [historiskeGrenserIsLoading, setHistoriskeGrenserIsLoading] = useState(false);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const { activeTool, activeModeTools } = useToolbar();
  const toast = useToast();
  const { addHistoryEntry } = useHistory();
  const { currentlyEditingInndelinger } = useInndelinger();
  const { addHistoriskeGrenserStyles } = useFeatureStyle();
  const auth = useAuthentication();
  // Todo: Fjerne tidligere hentede historiske-grenser hvis man henter på nytt
  async function getHistoriskeGrenser(gyldigTilDate: string) {
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
    const featureCollection = {
      type: "FeatureCollection" as const,
      features: grenserFeatures,
    };
    const featureGeometryCollection = geoJsonToSource(featureCollection).getFeatures();
    featureGeometryCollection.forEach((feature) => {
      // Legger til en midlertidig id på featuren, så grensene ikke erstatter andre versjoner av grensa i kartet med samme id
      const newId = getTempFeatureId();
      feature.setId(newId);
    });

    if (featureGeometryCollection.length > 0) {
      setAllFeatures(featureGeometryCollection);
      addHistoriskeGrenserStyles(featureGeometryCollection.map((f) => f.getId() as string));
      addFeaturesToSource("historiskGrense", featureGeometryCollection);
      for (const feature of featureGeometryCollection) {
        feature.setStyle(grenseStyles.historiskGrense);
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
  }

  const gjenopprettHistoriskeGrenser = (featuresToRestore: Feature<LineString>[]) => {
    if (featuresToRestore.length === 0) {
      return;
    }

    let countSaved = 0;
    featuresToRestore.forEach((featureToRestore, idx, array) => {
      // Sjekk om det er en historisk grense og om den er i allFeatures (Egentlig sjekket ved klikk på grense, så denne er mest sannsynlig unødvendig)
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
      // Endre featureens gyldigTil til å være null, resten av metadata tar vi vare på
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
      // Fjerner grense fra historiskGrense-laget og legger tilbake i edit-laget
      removeFeaturesFromSourceByIds("historiskGrense", [featureToRestore.getId() as string]);
      addFeaturesToSource("edit", [featureToRestore]);
      featureToRestore.setStyle(grenseType === "STEMMEKRETS" ? grenseStyles.stemmekrets : grenseStyles.grunnkrets);
      if (currentlyEditingInndelinger.length === 0) {
        return;
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
        if (countSaved > 0) {
          toast({
            status: "success",
            title: `Gjenopprettet ${countSaved > 1 ? countSaved + " historiske grenser" : countSaved + " historisk grense"}`,
            description: `Husk å sette tilhørighet på grensene`,
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
    const source = grenserLayers.historiskGrense.getSource();

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
        removeFeaturesFromSourceByIds("historiskGrense", [feature.getId() as string]);
      });
      clearHistoriskeGrenser();
      setAllFeatures([]);
      setHistoriskeGrenserIsLoading(false);
    }
  }, [activeTool, activeModeTools, allFeatures, historiskeGrenserIsLoading]);

  return {
    historiskeGrenserIsLoading,
    allFeatures,
    getHistoriskeGrenser,
    gjenopprettHistoriskeGrenser,
  };
};

export default useGetHistoriskeGrenser;
