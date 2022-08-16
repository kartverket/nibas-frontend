import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { updateGrenser } from "api/grenser";
import useEditInteractions from "hooks/interactions/useEditInteractions";

type EditContextType = "grense";

type Draft = {
  grense: Record<string, Feature<LineString>>;
};

export type ToolbarContextValue = {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
};

const emptyDraft: Draft = {
  grense: {},
};

const ToolbarContext = createContext<ToolbarContextValue | undefined>(
  undefined
);

export const ToolbarProvider: React.FC = ({ children }) => {
  const [draft, setDraft] = useState(emptyDraft);

  const value = {
    draft,
    setDraft,
  };

  return (
    <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
  );
};

export const useToolbar = () => {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbar must be used within a ToolbarContext");
  }

  const { draft, setDraft } = context;
  const { dirtyFeatureIds, clearHistory, undo, redo } = useEditInteractions();

  const { tokenHolderFunc } = useAuthenticationFlow();

  const canSave = Object.keys(draft).some(
    (type) => Object.keys(draft[type as EditContextType]).length > 0
  );

  useEffect(() => {
    console.log(draft);
  }, [draft]);

  const save = async () => {
    const savePromises = Object.keys(draft).map(async (t) => {
      const type = t as keyof Draft;

      switch (type) {
        case "grense": {
          const features = Object.values(draft.grense);
          console.log("Draft features", features);
          console.log("Dirty feature ids", dirtyFeatureIds);
          const editedFeatures = features.filter((feature) =>
            dirtyFeatureIds.includes((feature.getId() as string) ?? "")
          );

          clearHistory();
          return updateGrenser(editedFeatures, tokenHolderFunc()?.token);
        }
      }
    });

    await Promise.all(savePromises);

    setDraft(emptyDraft);
  };

  return {
    canSave,
    save,
    undo,
    redo,
  };
};

export const useToolbarSave = <T extends EditContextType>(contextType: T) => {
  const context = useContext(ToolbarContext);

  if (!context) {
    throw new Error("useToolbarSave must be used within a ToolbarContext");
  }

  const { setDraft } = context;

  const updateSubDraft = useCallback(
    (id: string, value: Draft[T][string]) =>
      setDraft((prevDraft) => ({
        ...prevDraft,
        [contextType]: {
          ...prevDraft[contextType],
          [id]: value,
        },
      })),
    [setDraft, contextType]
  );

  return {
    updateDraft: updateSubDraft,
  };
};

// lang scroll på vindu i stor skjerm
