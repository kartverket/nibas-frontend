import React, { createContext, useContext, useState } from "react";
import {
  EditingObject,
  EditingType,
  GrenseDictionary,
  ObjectValue,
} from "./types";
import { removeAllFeatures } from "utils/map/layers";

export type EditGrenserContextValue = {
  editingObject: EditingObject;
  setEditingObject: React.Dispatch<
    React.SetStateAction<Partial<Record<EditingType, GrenseDictionary>>>
  >;
  setObjectValue: (
    type: EditingType,
    grenseId: string,
    values?: ObjectValue
  ) => void;
  resetEditingObject: () => void;
};

/**
 * Bruk heller EditGrenserProvider i koden
 */
export const EditGrenserContext = createContext<
  EditGrenserContextValue | undefined
>(undefined);

export const EditGrenserProvider: React.FC = ({ children }) => {
  const [editingObject, setEditingObject] = useState<EditingObject>({});

  const setObjectValue = (
    type: EditingType,
    grenseId: string,
    values: ObjectValue = {}
  ) => {
    setEditingObject((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [grenseId]: values,
      },
    }));
  };

  const resetEditingObject = () => {
    removeAllFeatures();
    setEditingObject(() => ({}));
  };

  const value = {
    editingObject,
    setEditingObject,
    setObjectValue,
    resetEditingObject,
  };

  return (
    <EditGrenserContext.Provider value={value}>
      {children}
    </EditGrenserContext.Provider>
  );
};

export const useEditAllGrenser = () => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error(
      "useEditAllGrenser must be used within a EditGrenserProvider"
    );
  }

  return context;
};

export const useEditGrenser = (grenseType: EditingType) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error("useEditGrenser must be used within a EditGrenserProvider");
  }

  const {
    editingObject,
    setObjectValue,
    setEditingObject,
    resetEditingObject,
  } = context;

  const values = editingObject[grenseType] ?? {};

  const setObjectValueForType = (grenseId: string, newValues: ObjectValue) =>
    setObjectValue(grenseType, grenseId, newValues);

  const setMultipleValues = (newDictionary: GrenseDictionary) => {
    setEditingObject((prevEditingObject) => ({
      ...prevEditingObject,
      [grenseType]: newDictionary,
    }));
  };

  return {
    values,
    setObjectValue: setObjectValueForType,
    setMultipleValues,
    resetEditingObject,
  };
};

export const useEditGrenseValue = (
  grenseType: EditingType,
  grenseId: string
) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error(
      "useEditGrenseValue must be used within a EditGrenserProvider"
    );
  }

  const { editingObject } = context;
  const values = editingObject[grenseType] ?? {};
  const value = values[grenseId] ?? {};

  return value;
};
