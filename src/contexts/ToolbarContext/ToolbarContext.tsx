import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { useSWRConfig } from "swr";
import { EditContextType, ToolbarContextValue, ToolbarDraft } from "./types";
import { updateGrunnkrets } from "api/enheter";
import { updateGrenser } from "api/grenser";
import useEditInteractions from "hooks/interactions/useEditInteractions";

const emptyDraft: ToolbarDraft = {
  grense: {},
  grunnkrets: {},
};

/**
 * @deprecated Ikke bruk utenfor ToolbarContext.tsx, bruk heller useToolbar eller useToolbarSave
 */
export const ToolbarContext = createContext<ToolbarContextValue | undefined>(
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
  const { mutate } = useSWRConfig();
  const { dirtyFeatureIds, clearHistory, undo, redo } = useEditInteractions();

  const { tokenHolderFunc } = useAuthenticationFlow();

  const canSave = Object.keys(draft).some(
    (type) => Object.keys(draft[type as EditContextType]).length > 0
  );

  useEffect(() => {
    console.log(draft);
  }, [draft]);

  const save = async () => {
    const token = tokenHolderFunc()?.token;

    const savePromises = Object.keys(draft).map(async (t) => {
      const type = t as keyof ToolbarDraft;

      switch (type) {
        case "grense": {
          const features = Object.values(draft.grense);

          if (features.length === 0) return;

          console.log("Draft features", features);
          console.log("Dirty feature ids", dirtyFeatureIds);
          const editedFeatures = features.filter((feature) =>
            dirtyFeatureIds.includes((feature.getId() as string) ?? "")
          );

          clearHistory();

          return updateGrenser(editedFeatures, token);
        }
        case "grunnkrets": {
          const kommuneIds = Object.keys(draft.grunnkrets);

          const promises = kommuneIds.map(async (kommuneId) => {
            const grunnkretserDraft = draft.grunnkrets[kommuneId];

            const grunnkretserPromises = Object.keys(grunnkretserDraft).map(
              async (grunnkretsId) => {
                await updateGrunnkrets(
                  grunnkretserDraft[grunnkretsId],
                  grunnkretsId,
                  token
                );

                return mutate([`/v1/grunnkretser/${grunnkretsId}`, token]);
              }
            );

            await Promise.all(grunnkretserPromises);

            return mutate([`/v1/kommuner/${kommuneId}/grunnkretser`, token]);
          });

          return Promise.all(promises);
        }
      }

      // sikre at vi har håndtert alle cases i switch
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _: never = type;
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
    (id: string, value: ToolbarDraft[T][string]) =>
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
