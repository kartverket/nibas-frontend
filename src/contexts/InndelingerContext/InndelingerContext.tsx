import { grenserLayers } from "hooks/layers/constants";
import { createContext, useContext, useState } from "react";
import { removeEditedFeaturesFromSourceByIds } from "utils/map/source";

export const KRETSTYPER = ["fylker", "kommuner", "stemmekretser", "grunnkretser"] as const;
type Kretstyper = typeof KRETSTYPER;
export type Kretstype = Kretstyper[number];

type Inndeling = {
  id: string;
  kretstype: Kretstype;
  isVisible: boolean;
  isEditing: boolean;
};

type Inndelinger = {
  [id: string]: Inndeling;
};

export type InndelingerContextValue = {
  inndelinger: Inndelinger;
  selectInndeling: (fylkeId: string, kretstype: Kretstype, isEditingPanel: boolean) => void;
  currentlyEditedInndeling: Inndeling | null;
};

export const InndelingerContext = createContext<InndelingerContextValue | undefined>(undefined);

export const InndelingerProvider = ({ children }: { children: React.ReactNode }) => {
  const [inndelinger, setInndelinger] = useState<Inndelinger>({});

  /**
   * Sjekker om det er en inndeling som redigeres
   * @returns Inndelingen som redigeres dersom den finnes, null ellers
   */
  const isEditingInndelinger = () => {
    const activeEditingInndeling = Object.values(inndelinger).find((inndeling) => inndeling.isEditing);
    return activeEditingInndeling ?? null;
  };

  const selectInndeling = (id: string, kretstype: Kretstype, isEditingPanel: boolean) => {
    const setNyeInndelinger = (isVisible: boolean, isEditing: boolean) => {
      const nyeInndelinger: Inndelinger = {
        ...inndelinger,
        [id]: { id, kretstype, isVisible, isEditing },
      };

      // Hvis man skal skru på redigering må vi skru det av på andre inndelinger
      if (isEditing) {
        const activeEditingInndeling = isEditingInndelinger();
        if (activeEditingInndeling) {
          nyeInndelinger[activeEditingInndeling.id] = {
            ...activeEditingInndeling,
            isVisible: false,
            isEditing: false,
          };
        }
      }

      setInndelinger(nyeInndelinger);
    };

    const existingInndeling = inndelinger[id];

    if (isEditingPanel) {
      if (existingInndeling?.isEditing) {
        // Dersom man er i redigeringspanelet skal inndelingen skrus helt av
        setNyeInndelinger(false, false);
        const editSource = grenserLayers.edit.getSource();
        if (editSource) {
          editSource.clear(true);
        }
      } else {
        // Man skrur på redigering for en inndeling
        // TODO: legg til håndtering av at kun én ting skal kunne redigeres om gangen
        setNyeInndelinger(true, true);
      }
    } else {
      if (existingInndeling?.isVisible) {
        // Dersom inndelingen er synlig skal den ikke være synlig lengre
        setNyeInndelinger(false, existingInndeling?.isEditing ?? false);
      } else {
        // Man skrur på visning for en inndeling
        setNyeInndelinger(true, false);
      }
    }
  };

  const value = { inndelinger, selectInndeling, currentlyEditedInndeling: isEditingInndelinger() };

  return <InndelingerContext.Provider value={value}>{children}</InndelingerContext.Provider>;
};

export const useInndelinger = () => {
  const context = useContext(InndelingerContext);
  if (!context) {
    throw new Error("useInndelinger must be used within a InndelingerContext");
  }

  return context;
};
