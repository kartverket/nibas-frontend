import React, { createContext, useCallback, useContext, useState } from "react";
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

  console.log(editingObject);

  const setObjectValue = (
    type: EditingType,
    grenseId: string,
    values: ObjectValue = {}
  ) => {
    setEditingObject({
      ...editingObject,
      [type]: {
        ...editingObject[type],
        [grenseId]: values,
      },
    });
  };

  const resetEditingObject = useCallback(() => {
    removeAllFeatures();
    setEditingObject({});
  }, []);

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
    setEditingObject({
      ...editingObject,
      [grenseType]: newDictionary,
    });
  };

  const stopAllOtherEditing = (selectedGrenseId: string) => {
    for (const [grenseTypeId, grenseDictionary] of Object.entries(
      editingObject
    )) {
      console.log(grenseTypeId);
      for (const [grenseId, grenseObject] of Object.entries(grenseDictionary)) {
        console.log(grenseId);
        console.log(grenseId === selectedGrenseId);
        // Ingenting skjer når man kaller på dette.
        setObjectValue(grenseTypeId as EditingType, grenseId, {
          visible: grenseObject.visible,
          editing: grenseId === selectedGrenseId,
        });
      }
    }
    // Dette skal være "the nuclear option", og den gjør ingenting
    // setEditingObject({});
  };

  return {
    values,
    setObjectValue: setObjectValueForType,
    setMultipleValues,
    stopAllOtherEditing,
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
