import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { removeNil } from "utils/list-utils";
import { getLayerById } from "utils/map/layers";
import { GrenseId } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry, LineString } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";
import useInndelingFeatures from "./useInndelingFeatures";

export const INNDELINGTYPER = ["fylke", "kommune", "stemmekrets", "grunnkrets"] as const;
type Inndelingtyper = typeof INNDELINGTYPER;
export type Inndelingtype = Inndelingtyper[number];

export type Inndeling = {
  id: string;
  inndelingtype: Inndelingtype;
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

  getNewInndeling: (id: string, type: Inndelingtype, isEditing: boolean) => Inndeling;

  clearInndelingerAndSources: () => void;

  selectedFylkeId: string;
  setSelectedFylkeId: (id: string) => void;

  selectedFlatedataInndeling: Inndeling | null;
  setSelectedFlatedataInndeling: (inndeling: Inndeling | null) => void;
};

const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>(getEmptyInndelinger());

  const { setFeatureStylesForUtkast } = useFeatureStyle();

  const previousInndelinger = useRef<Inndelinger>();
  if (previousInndelinger.current == null) previousInndelinger.current = getEmptyInndelinger();

  const [selectedFylkeId, setSelectedFylkeId] = useState("");
  const [selectedInndelinger, setSelectedInndelinger] = useState<Inndeling[]>([]);

  // TODO: mellomløsning for flatedata i visningsmodus til vi får skrevet det om
  const [selectedFlatedataInndeling, setSelectedFlatedataInndeling] = useState<Inndeling | null>(null);

  const { isFetching, inndelingFeatures, utkastFeaturesInInndeling } = useInndelingFeatures(selectedInndelinger);
  const { utkast } = useUtkast();

  const isSameInndelinger = (a: Inndeling, b: Inndeling): boolean => {
    return a.id === b.id && a.inndelingtype === b.inndelingtype;
  };

  const isEqualInndelinger = (a: Inndeling, b: Inndeling): boolean => {
    return (
      a.id === b.id && a.inndelingtype === b.inndelingtype && a.isVisible === b.isVisible && a.isEditing === b.isEditing
    );
  };

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
            zoomToFeatures(features);
          });
        }
      }
    };

    const removeInndelingFromLayer = (layer: GrenseId, features: Feature<Geometry>[]) => {
      const featureIds = removeNil(features.map((feature) => feature.getId()?.toString()));
      removeFeaturesFromSourceByIds(layer, featureIds);
    };

    if (inndelingFeatures.length === 0) return;

    for (const inndelingWithFeatures of inndelingFeatures) {
      const currentInndeling = selectedInndelinger.find((inndeling) => {
        return inndeling.id === inndelingWithFeatures.id && inndeling.inndelingtype === inndeling.inndelingtype;
      });

      if (!currentInndeling) continue;

      const defaultPreviousinndeling = {
        id: currentInndeling.id,
        inndelingtype: currentInndeling.inndelingtype,
        isEditing: false,
        isVisible: false,
      };

      const previousInndeling = previousInndelinger.current
        ? previousInndelinger.current[currentInndeling.inndelingtype].get(currentInndeling.id) ??
          defaultPreviousinndeling
        : defaultPreviousinndeling;

      if (
        previousInndeling.inndelingtype !== currentInndeling.inndelingtype ||
        previousInndeling.isEditing !== currentInndeling.isEditing
      ) {
        editSource.clear(true);
        if (currentInndeling.isEditing) {
          // TODO Kan man unngå så mye looping her? Er det en potensiell performance save?
          const inndelingFeaturesExcludedUtkastFeatures: Feature<Geometry>[] = [...utkastFeaturesInInndeling];

          for (const feature of inndelingWithFeatures.features) {
            const featureIfInUtkast = inndelingFeaturesExcludedUtkastFeatures.find(
              (featureFromUtkast) => featureFromUtkast.getId()?.toString() === feature.getId()?.toString(),
            );

            if (!featureIfInUtkast) {
              inndelingFeaturesExcludedUtkastFeatures.push(feature);
            }
          }

          const sammenslaaingFeaturesWithDuplicates: Feature<Geometry>[] = [];

          if (currentInndeling.inndelingtype === "stemmekrets") {
            const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
            if (sammenslaaing != null) {
              const innlemmedeStemmekretsIder = sammenslaaing.stemmekretserTilSammenslaaing.map(
                (stemmekrets) => stemmekrets.lokalId,
              );

              const stemmekretsInSammenslaaingIds = [
                sammenslaaing.viderefoertStemmekrets.lokalId,
                ...innlemmedeStemmekretsIder,
              ];

              for (const feature of inndelingWithFeatures.features) {
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
          }

          addInndelingToLayer(
            "edit",
            inndelingFeaturesExcludedUtkastFeatures,
            utkastFeaturesInInndeling,
            sammenslaaingFeaturesWithDuplicates,
          );
        }
      }

      if (previousInndeling.isVisible !== currentInndeling.isVisible) {
        if (!currentInndeling.isVisible) {
          removeInndelingFromLayer(currentInndeling.inndelingtype, inndelingWithFeatures.features);
        } else {
          addInndelingToLayer(currentInndeling.inndelingtype, inndelingWithFeatures.features);
        }
      }
    }

    setSelectedInndelinger([]);
  }, [
    inndelingFeatures,
    selectedInndelinger,
    setFeatureStylesForUtkast,
    utkast?.operasjoner.stemmekretsSammenslaaingsendring,
    utkastFeaturesInInndeling,
  ]);

  const clearInndelingerAndSources = () => {
    for (const layer of Object.values(grenserLayers)) {
      const source = layer.getSource();
      source?.clear(true);
    }
    setSelectedInndelinger([]);
    setInndelinger(getEmptyInndelinger());
  };

  /**
   * Sjekker hvilke inndelinger som redigeres
   * @returns Inndelingene som redigeres dersom de finnes, tom liste ellers
   */
  const getCurrentlyEditingInndelinger = (): Inndeling[] => {
    const currentlyEditingInndelinger: Inndeling[] = [];
    for (const inndelingerType of Object.values(inndelinger)) {
      for (const [, inndeling] of inndelingerType) {
        if (inndeling.isEditing) currentlyEditingInndelinger.push(inndeling);
      }
    }

    return currentlyEditingInndelinger;
  };

  /**
   * Gir deg en inndeling basert på hva inndelinger allerede er. Dersom du for eksempel åpner en inndeling som allerede var åpnet, så vil denne automatisk
   * flippe `isVisible` til `false`.
   * @returns Inndeling med nye verdier basert på tidligere, eller en default Inndeling
   */
  const getNewInndeling = (inndelingId: string, inndelingtype: Inndelingtype, isEditing: boolean): Inndeling => {
    const newInndeling: Inndeling = {
      id: inndelingId,
      inndelingtype: inndelingtype,
      isEditing: isEditing,
      isVisible: !isEditing,
    };

    const inndelingIfAlreadySelected = inndelinger[inndelingtype].get(inndelingId);

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

    for (const inndeling of inndelingerToSelect) {
      const inndelingIfExists = inndelinger[inndeling.inndelingtype].get(inndeling.id);

      if (inndelingIfExists != null) {
        if (isEqualInndelinger(inndelingIfExists, inndeling)) {
          continue;
        }
      }

      newInndelinger[inndeling.inndelingtype].set(inndeling.id, inndeling);
    }

    previousInndelinger.current = inndelinger;
    setInndelinger(newInndelinger);
    setSelectedInndelinger(inndelingerToSelect);
  };

  const value = {
    inndelinger,
    selectInndelinger,
    currentlyEditingInndelinger: getCurrentlyEditingInndelinger(),
    isLoadingInndeling: isFetching && inndelingFeatures.length === 0,

    getNewInndeling,

    clearInndelingerAndSources: useCallback(clearInndelingerAndSources, []),

    selectedFylkeId,
    setSelectedFylkeId,

    selectedFlatedataInndeling,
    setSelectedFlatedataInndeling,
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
