import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { addFeaturesToSource } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { removeNil } from "utils/list-utils";
import { getLayerById } from "utils/map/layers";
import { GrenseId } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { AdministrativEnhetNavn, FeatureProperties } from "types/api";
import useInndelingFeatures from "./useInndelingFeatures";
import { getFeatureFremtidigEndringDato } from "utils/features";
import {
  fetchActiveOverlayModalFromSessionStorage,
  fetchActiveOverlayPanelFromSessionStorage,
  fetchHistoryFromSessionStorage,
  fetchSelectedFeaturesFromSessionStorage,
  fetchSelectedPointFromSessionStorage,
  fetchMapPositionFromSessionStorage,
} from "contexts/application-state-utils";
import { useHistory } from "contexts/HistoryContext/HistoryContext";
import { useOverlayPanel } from "contexts/OverlayPanelContext";
import { exclusiveSelectTools } from "pages/Kart/interactions/useSelect";
import { useToolbar } from "contexts/ToolbarContext";
import { map } from "pages/Kart/constants";

export const INNDELINGTYPER = ["fylke", "kommune", "stemmekrets", "grunnkrets"] as const;
type Inndelingtyper = typeof INNDELINGTYPER;
export type Inndelingtype = Inndelingtyper[number];

export const pluralizeInndelingtype = (inndelingtype: Inndelingtype) => {
  switch (inndelingtype) {
    case "fylke":
    case "kommune":
      return inndelingtype + "r";
    case "stemmekrets":
    case "grunnkrets":
      return inndelingtype + "er";
  }
};

export type BaseInndeling = {
  id: string;
  nummer: string;
  navn: AdministrativEnhetNavn;
  inndelingtype: Inndelingtype;
};

export type Inndeling = BaseInndeling & {
  isVisible: boolean;
  isEditing: boolean;
};

export const isInndeling = (inndeling: Inndeling): inndeling is Inndeling => {
  if (
    inndeling instanceof Object &&
    "id" in inndeling &&
    "inndelingtype" in inndeling &&
    "isVisible" in inndeling &&
    "isEditing" in inndeling
  ) {
    return true;
  }
  return false;
};

type Inndelinger = {
  [inndelingtype in Inndelingtype]: Map<string, Inndeling>;
};

const getEmptyInndelinger = (): Inndelinger => {
  const inndelinger: Partial<Inndelinger> = {};

  for (const type of INNDELINGTYPER) {
    inndelinger[type] = new Map<string, Inndeling>();
  }

  return inndelinger as Inndelinger;
};

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
  selectInndelinger: (inndelinger: Inndeling[]) => void;

  currentlyEditingInndelinger: Inndeling[];
  isLoadingInndeling: boolean;

  getAllInndelinger: () => Inndeling[];

  clearInndelingerAndSources: () => void;

  selectedFylkeId: string;
  setSelectedFylkeId: (id: string) => void;

  isSameInndelinger: (a: Inndeling, b: Inndeling) => boolean;
};

export const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>(getEmptyInndelinger());

  const { setFeatureStylesForUtkast, setAndSaveFremtidigEndringStyles, addDirtyStyles } = useFeatureStyle();

  const [selectedFylkeId, setSelectedFylkeId] = useState("");
  const [inndelingerToFetch, setInndelingerToFetch] = useState<Inndeling[]>([]);

  const { isFetching, inndelingFeatures, utkastFeaturesInInndeling } = useInndelingFeatures(inndelingerToFetch);
  const { utkast } = useUtkast();

  const { reapplyCurrentEntries, getHistoryEntries } = useHistory();

  const isSameInndelinger = (a: Inndeling, b: Inndeling): boolean => {
    return a.id === b.id && a.inndelingtype === b.inndelingtype;
  };

  const { restoreHistoryState } = useHistory();
  const { selectPointOnFeature, addToSelection, selectFeatures } = useFeatureStyle();
  const { openOverlayModal, openOverlayPanel } = useOverlayPanel();
  const { activeTool } = useToolbar();

  const restoreApplicationState = useCallback(() => {
    const sessionStorageHistory = fetchHistoryFromSessionStorage();

    // TODO: Selected feature/point virker ikke.
    const selectedFeatures = fetchSelectedFeaturesFromSessionStorage();
    if (selectedFeatures != null && selectedFeatures.length > 0) {
      const mapPosition = fetchMapPositionFromSessionStorage();

      map.getView().animate({
        center: mapPosition?.center,
        zoom: mapPosition?.zoom,
      });
      if (exclusiveSelectTools.includes(activeTool)) {
        selectFeatures(selectedFeatures);
      } else {
        addToSelection(selectedFeatures[0]);
      }
    } else {
      zoomToFeatures(inndelingFeatures.flatMap((inndelingWithFeatures) => inndelingWithFeatures.features));
    }

    const selectedPointFromSessionStorage = fetchSelectedPointFromSessionStorage();
    if (selectedPointFromSessionStorage != null) {
      const coords = selectedPointFromSessionStorage.getGeometry()?.getCoordinates();
      if (coords == null) return;
      selectPointOnFeature(coords, selectedFeatures);
    }

    if (sessionStorageHistory != null) {
      restoreHistoryState(sessionStorageHistory);
    }

    const activeModalFromSessionStorage = fetchActiveOverlayModalFromSessionStorage();

    if (activeModalFromSessionStorage != null) {
      openOverlayModal(activeModalFromSessionStorage);
    }

    const activePanelFromSessionStorage = fetchActiveOverlayPanelFromSessionStorage();

    if (activePanelFromSessionStorage != null) {
      openOverlayPanel(activePanelFromSessionStorage);
    }
  }, [
    activeTool,
    addToSelection,
    inndelingFeatures,
    openOverlayModal,
    openOverlayPanel,
    restoreHistoryState,
    selectFeatures,
    selectPointOnFeature,
  ]);

  /**
   * Denne useEffecten er kjernen av motoren i InndelingerContext og tar for seg det å legge til features fra inndelingen i kartet
   *
   * Etter at bruker velger inndelinger i InndelingerPanel så blir alle features i inndelingen og utkastet hentet med useInndelingFeatures,
   * og så beregner vi hvordan disse skal legges inn i kartet gjennom denne useEffecten
   */
  useEffect(() => {
    const addInndelingToLayer = (
      layer: GrenseId,
      features: Feature<Geometry>[],
      changedFeaturesInUtkast: Feature<Geometry>[] = [],
      sammenslaaingFeaturesInUtkast: Feature<Geometry>[] = [],
    ) => {
      const inndelingSource = getLayerById(layer).getSource();

      if (inndelingSource) {
        const inndelingSourceFeatureIds = removeNil(
          inndelingSource.getFeatures().map((feature) => feature.getId()?.toString()),
        );
        const everyFetchedFeatureIsInSource = features.every((feature) =>
          inndelingSourceFeatureIds.includes(feature.getId()?.toString() ?? ""),
        );

        if (!everyFetchedFeatureIsInSource) {
          addFeaturesToSource(layer, features, () => {
            if (layer === "edit") {
              setFeatureStylesForUtkast(changedFeaturesInUtkast, sammenslaaingFeaturesInUtkast);

              const idsOfFeaturesInHistory = getHistoryEntries()
                .flatMap((entry) => [...entry.changes])
                .map((change) => change.id);
              addDirtyStyles(idsOfFeaturesInHistory);
            }
            const fremtidigEndringFeatureIds = removeNil(
              features
                .filter((feature) => getFeatureFremtidigEndringDato(feature) != null)
                .map((feature) => feature.getId()?.toString()),
            );

            setAndSaveFremtidigEndringStyles(fremtidigEndringFeatureIds);
          });
        }
      }
    };

    const getFeaturesForInndelingAndUtkast = (
      featuresInUtkast: Feature<Geometry>[],
      featuresInInndeling: Feature<Geometry>[],
    ): Feature<Geometry>[] => {
      const featuresInInndelingWithoutUtkastDuplicates: Feature<Geometry>[] = [...featuresInUtkast];

      for (const feature of featuresInInndeling) {
        const featureIfInUtkast = featuresInInndelingWithoutUtkastDuplicates.find(
          (featureFromUtkast) => featureFromUtkast.getId()?.toString() === feature.getId()?.toString(),
        );

        if (!featureIfInUtkast) {
          featuresInInndelingWithoutUtkastDuplicates.push(feature);
        }
      }

      return featuresInInndelingWithoutUtkastDuplicates;
    };

    const getSammenslaaingsFeaturesWithDuplicates = (
      featuresInInndeling: Feature<Geometry>[],
      inndelingType: Inndelingtype,
    ): Feature<Geometry>[] => {
      if (inndelingType !== "stemmekrets") return [];

      const sammenslaaingFeaturesWithDuplicates: Feature<Geometry>[] = [];

      const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
      if (sammenslaaing != null) {
        const innlemmedeStemmekretsIder = sammenslaaing.stemmekretserTilSammenslaaing.map(
          (stemmekrets) => stemmekrets.lokalId,
        );

        const stemmekretsInSammenslaaingIds = [
          sammenslaaing.viderefoertStemmekrets.lokalId,
          ...innlemmedeStemmekretsIder,
        ];

        for (const feature of featuresInInndeling) {
          const geometry = feature.getGeometry();

          // Filtrerer ut representasjonspunkt
          if (geometry instanceof LineString) {
            const properties = feature.getProperties() as FeatureProperties;

            const kontekstEgenskapIds = removeNil(
              properties.kontekstEgenskaper.flatMap((egenskap) => egenskap.id?.lokalid.value),
            );

            for (const id of kontekstEgenskapIds) {
              if (stemmekretsInSammenslaaingIds.includes(id)) sammenslaaingFeaturesWithDuplicates.push(feature);
            }
          }
        }
      }

      return sammenslaaingFeaturesWithDuplicates;
    };

    if (inndelingFeatures.length === 0) return;

    // Tøm alle sources som blir brukt, vi skal uansett legge til alle features på nytt for å sikre at ting er riktig
    if (inndelingerToFetch.every((inndeling) => inndeling.isEditing)) editSource.clear(true);
    for (const inndeling of inndelingerToFetch.filter((selectedInndeling) => selectedInndeling.isVisible)) {
      const source = getLayerById(inndeling.inndelingtype).getSource();
      if (source) source.clear(true);
    }

    for (const inndelingWithFeatures of inndelingFeatures) {
      const currentInndeling = inndelingerToFetch.find((inndeling) => {
        return inndeling.id === inndelingWithFeatures.id && inndeling.inndelingtype === inndeling.inndelingtype;
      });

      // Dette skal i praksis ikke skje, da inndelingFeatures er bygd opp basert på selectedInndelinger
      // Må uansett sjekke casen sånn at TypeScript vet at currentInndeling ikke er null videre
      if (!currentInndeling) continue;

      /**
       * Når vi legger inn inndelinger som redigeres må vi i tillegg til å deale med de vanlige featurene i inndelingen, deale med featurene som kommer fra utkastet
       * Det som må bli gjort er følgende:
       * 1. Beregne en union av features fra utkast og features fra inndeling uten duplikater, hvor features fra utkast får prioritet
       * 2. Hente alle features som ble påvirket av eventuelle stemmekretssammenslåinger
       * 3. Sette korrekt styling på ikke-redigerte features, utkastfeatures og sammmenslåingsfeatures
       */
      if (currentInndeling.isEditing) {
        const featuresInInndelingWithoutUtkastDuplicates = getFeaturesForInndelingAndUtkast(
          utkastFeaturesInInndeling,
          inndelingWithFeatures.features,
        );

        const sammenslaaingsFeaturesWithDuplicates = getSammenslaaingsFeaturesWithDuplicates(
          inndelingWithFeatures.features,
          currentInndeling.inndelingtype,
        );

        addInndelingToLayer(
          "edit",
          featuresInInndelingWithoutUtkastDuplicates,
          utkastFeaturesInInndeling,
          sammenslaaingsFeaturesWithDuplicates,
        );
      }

      if (currentInndeling.isVisible) {
        addInndelingToLayer(currentInndeling.inndelingtype, inndelingWithFeatures.features);
      }
    }

    // Reapply historikken slik at eventuelle features som har blitt endret på siden siste lagring er i sync med historikken
    reapplyCurrentEntries();
    restoreApplicationState();
    // Når vi er ferdig med å håndtere features for inndelinger man har valgt, så er det ikke lenger noen aktive inndelinger som må bli hentet
    // Dette sikrer også at featurene man får hentet fra inndelingene er tomme, og useEffecten ikke kjører flere ganger
    setInndelingerToFetch([]);
  }, [
    inndelingFeatures,
    setAndSaveFremtidigEndringStyles,
    inndelingerToFetch,
    setFeatureStylesForUtkast,
    utkast?.operasjoner.stemmekretsSammenslaaingsendring,
    utkastFeaturesInInndeling,
    reapplyCurrentEntries,
    restoreApplicationState,
    getHistoryEntries,
    addDirtyStyles,
  ]);

  const clearInndelingerAndSources = () => {
    for (const layer of Object.values(grenserLayers)) {
      const source = layer.getSource();
      source?.clear(true);
    }
    setInndelingerToFetch([]);
    setInndelinger(getEmptyInndelinger());
  };

  const getAllInndelinger = (): Inndeling[] => {
    return Object.values(inndelinger).flatMap((inndelingerMap) => [...inndelingerMap.values()]);
  };

  /**
   * Sjekker hvilke inndelinger som redigeres
   * @returns Inndelingene som redigeres dersom de finnes, tom liste ellers
   */
  const getCurrentlyEditingInndelinger = (): Inndeling[] => {
    return getAllInndelinger().filter((inndeling) => inndeling.isEditing);
  };

  const getNewInndeling = (newInndeling: Inndeling, isEditing: boolean): Inndeling => {
    const inndelingIfAlreadySelected = inndelinger[newInndeling.inndelingtype].get(newInndeling.id);

    if (inndelingIfAlreadySelected) {
      if (isEditing) {
        newInndeling.isVisible = inndelingIfAlreadySelected.isVisible;
      } else {
        newInndeling.isEditing = inndelingIfAlreadySelected.isEditing;
      }
    }

    return newInndeling;
  };

  const selectInndelinger = (inndelingerToSelect: Inndeling[]) => {
    const newInndelinger = structuredClone(inndelinger);

    const isNewEditingInndelinger = inndelingerToSelect.some((inndeling) => inndeling.isEditing);

    for (const inndeling of getAllInndelinger()) {
      // Dersom man redigerer nye inndelinger så skal alle gamle inndelinger som er i redigeringsmodus fjernes.
      // I tilfellet inndelingen har isVisible, så kan vi ikke fjerne den plent, og må bare flippe isEditing til false.
      // Dersom isEditing og isVisible begge blir false fjernes inndelingen senere
      if (isNewEditingInndelinger && inndeling.isEditing) {
        const notEditingInndeling: Inndeling = {
          ...inndeling,
          isEditing: false,
        };

        newInndelinger[notEditingInndeling.inndelingtype].set(notEditingInndeling.id, notEditingInndeling);
      }

      // Likt som over, så må vi forsikre oss om at alle inndelinger med isVisible fjernes dersom de ikke var med i innsendingen av nye inndelinger
      // Også her, siden den kan ha isEditing true, kan vi ikke bare fjerne den plent
      // Siden visningpanelet er additivt og ikke ekslusivt så forsikrer vi oss om å kun flippe inndelingen hvis den ikke er med i inndelingene vi har sendt inn
      if (!isNewEditingInndelinger && inndeling.isVisible) {
        const inndelingIsInSelected = inndelingerToSelect.some((toSelectInndeling) =>
          isSameInndelinger(inndeling, toSelectInndeling),
        );

        if (!inndelingIsInSelected) {
          const notVisibleInndeling: Inndeling = {
            ...inndeling,
            isVisible: false,
          };

          newInndelinger[notVisibleInndeling.inndelingtype].set(notVisibleInndeling.id, notVisibleInndeling);
        }
      }
    }

    for (const inndeling of inndelingerToSelect) {
      const newInndeling = getNewInndeling(inndeling, isNewEditingInndelinger);

      newInndelinger[newInndeling.inndelingtype].set(newInndeling.id, newInndeling);
    }

    // Rydder opp alle inndelinger som nå verken er synlige eller redigerte, slik at man andre steder i koden ikke trenger å
    // ta stilling til dette
    const newInndelingerList = Object.values(newInndelinger).flatMap((newInndelingerMap) => [
      ...newInndelingerMap.values(),
    ]);

    for (const newInndeling of newInndelingerList) {
      if (!newInndeling.isEditing && !newInndeling.isVisible) {
        newInndelinger[newInndeling.inndelingtype].delete(newInndeling.id);
      }
    }

    setInndelinger(newInndelinger);
    setInndelingerToFetch(newInndelingerList);
  };

  const value = {
    inndelinger,
    selectInndelinger,

    getAllInndelinger: getAllInndelinger,
    currentlyEditingInndelinger: getCurrentlyEditingInndelinger(),

    clearInndelingerAndSources,

    selectedFylkeId,
    setSelectedFylkeId,

    isLoadingInndeling: isFetching && inndelingFeatures.length === 0,
    isSameInndelinger,
  };

  return <InndelingerContext.Provider value={value}>{children}</InndelingerContext.Provider>;
};

export const useInndelinger = () => {
  const context = useContext(InndelingerContext);
  if (!context) {
    throw new Error("useInndelinger must be used within a InndelingerContext");
  }

  return context;
};
