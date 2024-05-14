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

type InndelingerContextValue = {
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

const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>(getEmptyInndelinger());

  const { setFeatureStylesForUtkast, setAndSaveFremtidigEndringStyles } = useFeatureStyle();

  const [selectedFylkeId, setSelectedFylkeId] = useState("");
  const [activeInndelinger, setActiveInndelinger] = useState<Inndeling[]>([]);

  const { isFetching, inndelingFeatures, utkastFeaturesInInndeling } = useInndelingFeatures(activeInndelinger);
  const { utkast } = useUtkast();

  const isSameInndelinger = (a: Inndeling, b: Inndeling): boolean => {
    return a.id === b.id && a.inndelingtype === b.inndelingtype;
  };

  const isEqualInndelinger = (a: Inndeling, b: Inndeling): boolean => {
    return (
      a.id === b.id && a.inndelingtype === b.inndelingtype && a.isVisible === b.isVisible && a.isEditing === b.isEditing
    );
  };

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
    if (activeInndelinger.some((inndeling) => inndeling.isEditing)) editSource.clear(true);
    for (const inndeling of activeInndelinger.filter((selectedInndeling) => selectedInndeling.isVisible)) {
      const source = getLayerById(inndeling.inndelingtype).getSource();
      if (source) source.clear(true);
    }

    for (const inndelingWithFeatures of inndelingFeatures) {
      const currentInndeling = activeInndelinger.find((inndeling) => {
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

    zoomToFeatures(inndelingFeatures.flatMap((inndelingWithFeatures) => inndelingWithFeatures.features));

    // Når vi er ferdig med å håndtere features for inndelinger man har valgt, så er det ikke lenger noen aktive inndelinger som må bli hentet
    // Dette sikrer også at featurene man får hentet fra inndelingene er tomme, og useEffecten ikke kjører flere ganger
    setActiveInndelinger([]);
  }, [
    inndelingFeatures,
    setAndSaveFremtidigEndringStyles,
    activeInndelinger,
    setFeatureStylesForUtkast,
    utkast?.operasjoner.stemmekretsSammenslaaingsendring,
    utkastFeaturesInInndeling,
  ]);

  const clearInndelingerAndSources = () => {
    for (const layer of Object.values(grenserLayers)) {
      const source = layer.getSource();
      source?.clear(true);
    }
    setActiveInndelinger([]);
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

    if (inndelingIfAlreadySelected && isSameInndelinger(newInndeling, inndelingIfAlreadySelected)) {
      if (isEditing) {
        newInndeling.isEditing = !inndelingIfAlreadySelected.isEditing;
        newInndeling.isVisible = inndelingIfAlreadySelected.isVisible;
      } else {
        newInndeling.isEditing = inndelingIfAlreadySelected.isEditing;
        newInndeling.isVisible = !inndelingIfAlreadySelected.isVisible;
      }
    }

    return newInndeling;
  };

  const selectInndelinger = (inndelingerToSelect: Inndeling[]) => {
    const newInndelinger = structuredClone(inndelinger);

    const isNewEditingInndelinger = inndelingerToSelect.some((inndeling) => inndeling.isEditing);

    for (const inndeling of getAllInndelinger()) {
      const inndelingIsInSelected = inndelingerToSelect.some(
        (toSelectInndeling) => inndeling.id === toSelectInndeling.id,
      );

      if (!inndelingIsInSelected) {
        // Dersom man redigerer nye inndelinger så skal alle gamle inndelinger som er i redigeringsmodus fjernes
        if (isNewEditingInndelinger && inndeling.isEditing) {
          const notEditingInndeling: Inndeling = {
            ...inndeling,
            isEditing: false,
          };

          newInndelinger[notEditingInndeling.inndelingtype].set(notEditingInndeling.id, notEditingInndeling);
        }

        if (!isNewEditingInndelinger && inndeling.isVisible) {
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

    const newInndelingerList = Object.values(newInndelinger).flatMap((newInndelingerMap) => [
      ...newInndelingerMap.values(),
    ]);

    for (const newInndeling of newInndelingerList) {
      if (!newInndeling.isEditing && !newInndeling.isVisible) {
        newInndelinger[newInndeling.inndelingtype].delete(newInndeling.id);
      }
    }

    console.log("new inndelinger", newInndelinger);

    setInndelinger(newInndelinger);
    setActiveInndelinger(inndelingerToSelect);
  };

  const value = {
    inndelinger,
    selectInndelinger,

    getAllInndelinger: useCallback(getAllInndelinger, [inndelinger]),
    currentlyEditingInndelinger: getCurrentlyEditingInndelinger(),

    clearInndelingerAndSources: useCallback(clearInndelingerAndSources, []),

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
