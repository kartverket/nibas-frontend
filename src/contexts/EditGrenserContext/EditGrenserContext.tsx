import React, { createContext, useContext, useState } from "react";
import { removeAllFeatures } from "utils/map/layers";
import {
  EditingObject,
  EditingType,
  GrenseDictionary,
  GrenseStatus,
} from "./types";

export type EditGrenserContextValue = {
  editingObject: EditingObject;
  setEditingObject: React.Dispatch<
    React.SetStateAction<Partial<Record<EditingType, GrenseDictionary>>>
  >;
  setObjectValue: (
    type: EditingType,
    grenseId: string,
    values?: GrenseStatus,
  ) => void;
  resetAndClearAllLayers: () => void;
  getCurrentlyEditingType: () => EditingType | null;
  setOtherEditingTypes: (
    currentType: EditingType,
    shouldBeEditable?: boolean,
  ) => void;
};

/**
 * Bruk heller EditGrenserProvider i koden
 */
export const EditGrenserContext = createContext<
  EditGrenserContextValue | undefined
>(undefined);

export const EditGrenserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [editingObject, setEditingObject] = useState<EditingObject>({});

  const setObjectValue = (
    type: EditingType,
    grenseId: string,
    status: GrenseStatus = {},
  ) => {
    setEditingObject((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [grenseId]: status,
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
        Object.values(grensevalues).some((grense) => grense.editing),
    );

    if (currentlyEditingType) {
      return currentlyEditingType[0] as EditingType;
    }
    return null;
  };

  const setOtherEditingTypes = (
    currentType: EditingType,
    shouldBeEditable?: boolean,
  ) => {
    const otherEditingTypes = Object.entries(editingObject).filter(
      ([editingType]) => editingType !== currentType,
    );

    otherEditingTypes.forEach((type) => {
      Object.entries(type[1]).forEach((grense) => {
        setObjectValue(type[0] as EditingType, grense[0], {
          visible: grense[1].visible,
          editing: shouldBeEditable ?? grense[1].editing,
        });
      });
    });
  };

  // Obs! Denne tømmer hele editingObject, som vil si at alle synlige saker fjernes også.
  const resetAndClearAllLayers = () => {
    removeAllFeatures();
    setEditingObject(() => ({}));
  };

  const value = {
    editingObject,
    setEditingObject,
    setObjectValue,
    resetAndClearAllLayers,
    getCurrentlyEditingType,
    setOtherEditingTypes,
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
      "useEditAllGrenser must be used within a EditGrenserProvider",
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
    resetAndClearAllLayers,
    setOtherEditingTypes,
  } = context;

  const values = editingObject[grenseType] ?? {};

  const setObjectValueForType = (grenseId: string, newValues: GrenseStatus) =>
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
    resetAndClearAllLayers,
    setOtherEditingTypes,
  };
};

export const useEditGrenseValue = (
  grenseType: EditingType,
  grenseId: string,
) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error(
      "useEditGrenseValue must be used within a EditGrenserProvider",
    );
  }

  const { editingObject } = context;
  const values = editingObject[grenseType] ?? {};
  const value = values[grenseId] ?? {};

  return value;
};
