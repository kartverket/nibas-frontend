import { createContext, useContext, useEffect, useState } from "react";
import useInndelingFeatures from "./useInndelingFeatures";
import { addFeaturesToSource } from "utils/map/source";
import { zoomToFeatures } from "utils/map/map-utils";
import { editSource } from "hooks/layers/constants";
import { useUtkast } from "contexts/UtkastContext/UtkastContext";

export const KRETSTYPER = ["fylke", "kommune", "stemmekrets", "grunnkrets"] as const;
type Kretstyper = typeof KRETSTYPER;
export type Kretstype = Kretstyper[number];

type InndelingStatus = "visible" | "editing" | null;

export type Inndeling = {
  id: string;
  kretstype: Kretstype;
  status: InndelingStatus;
};

type Inndelinger = {
  [id: string]: Inndeling;
};

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
  selectInndeling: (inndeling: Inndeling) => void;
  currentlyEditedInndeling: Inndeling | null;
  isLoadingInndeling: boolean;
};

export const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>({});

  const { isLoading, setInndeling, features, inndeling: currentIndeling } = useInndelingFeatures();
  const { utkast } = useUtkast();

  useEffect(() => {
    if (features && currentIndeling) {
      const sourceToAddTo = currentIndeling.status === "editing" ? "edit" : currentIndeling.kretstype;

      if (sourceToAddTo === "edit") editSource.clear();

      addFeaturesToSource(sourceToAddTo, features, () => zoomToFeatures(features));
    }
  }, [currentIndeling, features]);

  useEffect(() => {
    if (!utkast) {
      editSource.clear(true);
      setInndeling(null);
      setInndelinger({});
      // TODO Reset zoom? Kanskje ikke egentlig?
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
    const activeEditingInndeling = Object.values(inndelinger).find((inndeling) => inndeling.status === "editing");
    return activeEditingInndeling ?? null;
  };

  const selectInndeling = (inndeling: Inndeling) => {
    const inndelingIfExists = getInndeling(inndeling.id);

    if (
      inndelingIfExists &&
      inndelingIfExists.kretstype === inndeling.kretstype &&
      inndelingIfExists.status === inndeling.status
    )
      return;

    const nyeInndelinger: Inndelinger = {
      ...inndelinger,
      [inndeling.id]: inndeling,
    };

    if (inndeling.status === "editing") {
      const currentlyEditingInndeling = getCurrentlyEditingInndeling();
      if (currentlyEditingInndeling && currentlyEditingInndeling.id !== inndeling.id) {
        nyeInndelinger[currentlyEditingInndeling.id] = {
          ...currentlyEditingInndeling,
          status: null,
        };
      }
    }

    setInndeling(inndeling);
    setInndelinger(nyeInndelinger);
  };

  const value = {
    inndelinger,
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
