import { createContext, useContext, useEffect, useRef, useState } from "react";
import useInndelingFeatures from "./useInndelingFeatures";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { removeNil } from "utils/list-utils";
import { getLayerById } from "utils/map/layers";
import { GrenseId } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { FeatureProperties } from "types/api";

export const KRETSTYPER = ["fylke", "kommune", "stemmekrets", "grunnkrets"] as const;
type Kretstyper = typeof KRETSTYPER;
export type Kretstype = Kretstyper[number];

export type Inndeling = {
  id: string;
  kretstype: Kretstype;
  isVisible: boolean;
  isEditing: boolean;
};

export const isEqualInndelinger = (a: Inndeling, b: Inndeling): boolean => {
  return a.id === b.id && a.kretstype === b.kretstype && a.isVisible === b.isVisible && a.isEditing === b.isEditing;
};

export const isSameInndelinger = (a: Inndeling, b: Inndeling): boolean => {
  return a.id === b.id && a.kretstype === b.kretstype;
};

type Inndelinger = Map<string, Inndeling>;

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
  selectInndeling: (inndeling: Inndeling) => void;
  currentlyEditedInndeling: Inndeling | null;
  isLoadingInndeling: boolean;
};

export const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>(new Map<string, Inndeling>());

  const { setFeatureStylesForUtkastFeatures, setFeatureStylesForSammenslaaingsFeatures } = useFeatureStyle();

  const previousInndelinger = useRef<Inndelinger>();
  if (previousInndelinger.current == null) previousInndelinger.current = new Map<string, Inndeling>();

  const [selectedInndeling, setSelectedInndeling] = useState<Inndeling | null>(null);

  const [isHandlingFeatures, setIsHandlingFeatures] = useState(false);

  const { isFetching, inndelingFeatures, utkastFeaturesInInndeling } = useInndelingFeatures(selectedInndeling);
  const { utkast } = useUtkast();

  useEffect(() => {
    const addInndelingToLayer = (
      layer: GrenseId,
      features: Feature<Geometry>[],
      changedFeaturesInUtkast: Feature<Geometry>[],
      sammenslaaingFeaturesInUtkast: Feature<Geometry>[],
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
            zoomToFeatures(features);
            if (layer === "edit") {
              setFeatureStylesForUtkastFeatures(changedFeaturesInUtkast);
              setFeatureStylesForSammenslaaingsFeatures(sammenslaaingFeaturesInUtkast);
            }
          });
        }
      }
    };

    const removeInndelingFromLayer = (layer: GrenseId, features: Feature<Geometry>[]) => {
      const featureIds = removeNil(features.map((feature) => feature.getId()?.toString()));

      removeFeaturesFromSourceByIds(layer, featureIds);
    };

    if (!selectedInndeling) return;

    if (inndelingFeatures.length > 0) {
      setIsHandlingFeatures(true);
      const previousInndeling = previousInndelinger.current?.get(selectedInndeling.id) ?? {
        id: selectedInndeling.id,
        kretstype: selectedInndeling.kretstype,
        isEditing: false,
        isVisible: false,
      };

      if (
        previousInndeling.kretstype !== selectedInndeling.kretstype ||
        previousInndeling.isEditing !== selectedInndeling.isEditing
      ) {
        editSource.clear(true);
        if (selectedInndeling.isEditing) {
          // synes dette virket litt tungvindt, men lar det være per nå
          // tanken er bare å returnere en liste over alle features i inndelingen, men bruke feature fra utkast der disse finnes
          const inndelingFeaturesExcludedUtkastFeatures: Feature<Geometry>[] = [...utkastFeaturesInInndeling];
          const sammenslaaingFeaturesWithDuplicates: Feature<Geometry>[] = [];

          for (const inndelingFeature of inndelingFeatures) {
            const featureIfInUtkast = inndelingFeaturesExcludedUtkastFeatures.find(
              (featureFromUtkast) => featureFromUtkast.getId()?.toString() === inndelingFeature.getId()?.toString(),
            );

            if (!featureIfInUtkast) {
              inndelingFeaturesExcludedUtkastFeatures.push(inndelingFeature);
            }
          }

          if (selectedInndeling.kretstype === "stemmekrets") {
            const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
            if (sammenslaaing != null) {
              const innlemmedeStemmekretsIder = sammenslaaing.stemmekretserTilSammenslaaing.map(
                (stemmekrets) => stemmekrets.lokalId,
              );

              const stemmekretsInSammenslaaingIds = [
                sammenslaaing.viderefoertStemmekrets.lokalId,
                ...innlemmedeStemmekretsIder,
              ];

              for (const feature of inndelingFeatures) {
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

          // her kan det hende at features skal til archived ikke edit
          addInndelingToLayer(
            "edit",
            inndelingFeaturesExcludedUtkastFeatures,
            utkastFeaturesInInndeling,
            sammenslaaingFeaturesWithDuplicates,
          );
        }
      }

      if (previousInndeling.isVisible !== selectedInndeling.isVisible) {
        if (!selectedInndeling.isVisible) {
          removeInndelingFromLayer(selectedInndeling.kretstype, inndelingFeatures);
        } else {
          addInndelingToLayer(selectedInndeling.kretstype, inndelingFeatures, [], []);
        }
      }

      setIsHandlingFeatures(false);
      setSelectedInndeling(null);
    }
  }, [
    inndelingFeatures,
    selectedInndeling,
    setFeatureStylesForSammenslaaingsFeatures,
    setFeatureStylesForUtkastFeatures,
    utkast?.operasjoner.stemmekretsSammenslaaingsendring,
    utkastFeaturesInInndeling,
  ]);

  useEffect(() => {
    if (!utkast) {
      for (const layer of Object.values(grenserLayers)) {
        const source = layer.getSource();
        source?.clear(true);
      }
      setSelectedInndeling(null);
      setInndelinger(new Map<string, Inndeling>());
      // Reset zoom? Kanskje ikke egentlig?
    }
  }, [utkast]);

  /**
   * Sjekker om det er en inndeling som redigeres
   * @returns Inndelingen som redigeres dersom den finnes, null ellers
   */
  const getCurrentlyEditingInndeling = (): Inndeling | null => {
    for (const [, inndeling] of inndelinger) {
      if (inndeling.isEditing) return inndeling;
    }

    return null;
  };

  const selectInndeling = (inndeling: Inndeling) => {
    const inndelingIfExists = inndelinger.get(inndeling.id);

    if (inndelingIfExists != null) {
      if (isEqualInndelinger(inndelingIfExists, inndeling)) {
        // Her kan man anta at man har trykket på noe man allerede har trykket på, så kanskje man skal fjerne ting her?
        return;
      }
    }

    const newInndelinger: Inndelinger = new Map(inndelinger).set(inndeling.id, inndeling);

    if (inndeling.isEditing) {
      const currentlyEditingInndeling = getCurrentlyEditingInndeling();
      if (currentlyEditingInndeling && currentlyEditingInndeling.id !== inndeling.id) {
        newInndelinger.set(currentlyEditingInndeling.id, {
          ...currentlyEditingInndeling,
          isEditing: false,
        });
      }
    }

    previousInndelinger.current = inndelinger;
    setSelectedInndeling(inndeling);
    setInndelinger(newInndelinger);
  };

  const value = {
    inndelinger,
    setInndelinger,
    selectInndeling,
    currentlyEditedInndeling: getCurrentlyEditingInndeling(),
    isLoadingInndeling: isFetching || isHandlingFeatures,
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
