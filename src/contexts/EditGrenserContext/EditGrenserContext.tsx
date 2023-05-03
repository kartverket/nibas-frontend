import React, { createContext, useContext, useState } from "react";
import { removeAllFeatures } from "utils/map/layers";
import {
  EditingObject,
  EditingType,
  GrenseDictionary,
  ObjectValue,
} from "./types";

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
  resetAndClearEditingLayer: () => void;
  getCurrentlyEditingType: () => EditingType | null;
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

  /**
   * Går gjennom editingObject for å finne ut hva, om noe, som redigeres
   * @returns Hvilken grensetype man er i redigeringsmodus for, eller null hvis det er ingenting
   */
  const getCurrentlyEditingType = () => {
    const currentlyEditingType = Object.entries(editingObject).find(
      ([, grensevalues]) =>
        Object.values(grensevalues).some((grense) => grense.editing)
    );

    if (currentlyEditingType) {
      return currentlyEditingType[0] as EditingType;
    }
    return null;
  };

  const resetAndClearEditingLayer = () => {
    removeAllFeatures();
    setEditingObject(() => ({}));
  };

  const value = {
    editingObject,
    setEditingObject,
    setObjectValue,
    resetAndClearEditingLayer,
    getCurrentlyEditingType,
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
    resetAndClearEditingLayer,
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
    resetAndClearEditingLayer,
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
