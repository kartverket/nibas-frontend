import { createContext, useContext, useEffect, useState } from "react";
import useInndelingFeatures from "./useInndelingFeatures";
import { addFeaturesToSource, removeFeaturesFromSourceByIds } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource, grenserLayers } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";
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

  const [selectedInndeling, setSelectedInndeling] = useState<Inndeling | null>(null);

  const { isLoading, features } = useInndelingFeatures(selectedInndeling);
  const { utkast } = useUtkast();

  useEffect(() => {
    if (!selectedInndeling) return;

    console.log(selectedInndeling);

    if (features) {
      if (!selectedInndeling.isEditing) {
        // Hvis inndelingen som nå er fjernet er i edit laget så kan vi bare fjerne hele laget i stedet for å fjerne features
        editSource.clear(true);
        console.log("removing edit layer");
      } else {
        editSource.clear(true);
        addFeaturesToSource("edit", features, () => {
          zoomToFeatures(features);
        });
        console.log("adding edit layer");
      }

      if (!selectedInndeling.isVisible) {
        const featureIds = removeNil(features.map((feature) => feature.getId()?.toString()));

        removeFeaturesFromSourceByIds(selectedInndeling.kretstype, featureIds);

        console.log("removing visible layer");
      } else {
        addFeaturesToSource(selectedInndeling.kretstype, features, () => {
          zoomToFeatures(features);
        });

        console.log("adding visible layer");
      }

      setSelectedInndeling(null);
    }
  }, [features, selectedInndeling]);

  /**
   * 1. isEditing true |isViewing false -> skal vise edit layer
   * 2. isEditing true |isViewing true -> skal legge til view layer, ikke slette isEditing eller cleare den
   * 3. isEditing true |isViewing false -> skal slette view layer, ikke isEditing
   */

  useEffect(() => {
    if (!utkast) {
      for (const layer of Object.values(grenserLayers)) {
        const source = layer.getSource();
        source?.clear(true);
      }
      setSelectedInndeling(null);
      setInndelinger({});
      // Reset zoom? Kanskje ikke egentlig?
    }
  }, [utkast]);

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
      console.log("ifexists", inndelingIfExists);
      console.log("new", inndeling);
      if (isEqualInndelinger(inndelingIfExists, inndeling)) {
        // Her kan man anta at man har trykket på noe man allerede har trykket på, så kanskje man skal fjerne ting her?
        return;
      }
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
        };
      }
    }

    setSelectedInndeling(inndeling);
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
