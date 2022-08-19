import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { EditContextType, ToolbarContextValue, ToolbarDraft } from "./types";
import useSaveHandlers from "./useSaveHandlers";

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

  const { saveGrunnkretser, saveGrenser, undo, redo } = useSaveHandlers(draft);

  const canSave = Object.keys(draft).some(
    (type) => Object.keys(draft[type as EditContextType]).length > 0
  );

  useEffect(() => {
    console.log(draft);
  }, [draft]);

  const save = async () => {
    const savePromises = Object.keys(draft).map(async (t) => {
      const type = t as keyof ToolbarDraft;

      switch (type) {
        case "grense": {
          return saveGrenser();
        }
        case "grunnkrets": {
          return saveGrunnkretser();
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
