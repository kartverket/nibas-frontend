import { createContext, useContext, useEffect, useState } from "react";
import useInndelingFeatures from "./useInndelingFeatures";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { isNotNil } from "utils/type-utils";
import { removeNil } from "utils/list-utils";

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

type Inndelinger = {
  [id: string]: Inndeling;
};

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
  getInndeling: (id: string) => Inndeling | null;
  selectInndeling: (inndeling: Inndeling) => void;
  currentlyEditedInndeling: Inndeling | null;
  isLoadingInndeling: boolean;
};

export const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>({});

  const { isLoading, setInndeling, features, inndeling: fetchedInndeling } = useInndelingFeatures();
  const { utkast } = useUtkast();

  useEffect(() => {
    if (features && fetchedInndeling) {
      const source = fetchedInndeling.isEditing ? "edit" : fetchedInndeling.kretstype;
      const actualInndeling = Object.values(inndelinger).find((i) => i.id === fetchedInndeling.id);

      if (actualInndeling) {
        if (!actualInndeling.isEditing && !actualInndeling.isVisible) {
          // Hvis inndelingen som nå er fjernet er i edit laget så kan vi bare fjerne hele laget i stedet for å fjerne features
          if (source === "edit") {
            editSource.clear(true);
            return;
          }

          const featureIds = removeNil(features.map((feature) => feature.getId()?.toString()));

          // use effecten blir kalt flere ganger her som gjør at vi potensielt fjerner for mange grenser
          // dette skjer f. eks hvis man legger til grensende kommuner, så fjerner én av dem. først så funker det, så fjerner man overlappet ved runde to
          removeFeaturesFromSourceByIds(source, featureIds);
          return;
        }
      }

      // Finne ut hvordan man vil zoome her
      // Her må man også style featurene som kommer fra utkastet, men på et vis ikke forårsake evig loop med useEffecten
      addFeaturesToSource(source, features, () => {
        zoomToFeatures(features);
      });
    }
  }, [fetchedInndeling, features, inndelinger]);

  useEffect(() => {
    if (!utkast) {
      for (const layer of Object.values(grenserLayers)) {
        const source = layer.getSource();
        source?.clear(true);
      }
      setInndeling(null);
      setInndelinger({});
      // Reset zoom? Kanskje ikke egentlig?
    }
  }, [setInndeling, utkast]);

  const getInndeling = (id: string): Inndeling | null => {
    const isInndelingPresent = id in inndelinger;

    if (isInndelingPresent) return inndelinger[id];

    return null;
  };

  /**
   * Sjekker om det er en inndeling som redigeres
   * @returns Inndelingen som redigeres dersom den finnes, null ellers
   */
  const getCurrentlyEditingInndeling = (): Inndeling | null => {
    const activeEditingInndeling = Object.values(inndelinger).find((inndeling) => inndeling.isEditing);
    return activeEditingInndeling ?? null;
  };

  const selectInndeling = (inndeling: Inndeling) => {
    const inndelingIfExists = getInndeling(inndeling.id);

    if (inndelingIfExists) {
      if (isEqualInndelinger(inndelingIfExists, inndeling)) {
        // Her kan man anta at man har trykket på noe man allerede har trykket på, så kanskje man skal fjerne ting her?
        return;
      }
    }

    if (!inndeling.isVisible && !inndeling.isEditing) {
      // her må vi klare å cleare ut fra ikke-edit source også.. but how
      editSource.clear(true);
    }

    const nyeInndelinger: Inndelinger = {
      ...inndelinger,
      [inndeling.id]: inndeling,
    };

    if (inndeling.isEditing) {
      const currentlyEditingInndeling = getCurrentlyEditingInndeling();
      if (currentlyEditingInndeling && currentlyEditingInndeling.id !== inndeling.id) {
        nyeInndelinger[currentlyEditingInndeling.id] = {
          ...currentlyEditingInndeling,
          isEditing: false,
          isVisible: false,
        };

        editSource.clear(true);
      }
    }

    setInndeling(inndeling);
    setInndelinger(nyeInndelinger);
  };

  const value = {
    inndelinger,
    getInndeling,
    selectInndeling,
    currentlyEditedInndeling: getCurrentlyEditingInndeling(),
    isLoadingInndeling: isLoading,
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
