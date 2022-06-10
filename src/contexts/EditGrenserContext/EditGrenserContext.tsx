import React, { createContext, useContext, useState } from "react";
import { EditingObject, EditingType, ObjectValue } from "./types";

export type EditGrenserContextValue = {
  editingObject: EditingObject;
  setObjectValue: (
    type: EditingType,
    grenseId: string,
    values?: ObjectValue
  ) => void;
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
    setEditingObject({
      ...editingObject,
      [type]: {
        ...editingObject[type],
        [grenseId]: values,
      },
    });
  };

  const value = {
    editingObject,
    setObjectValue,
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

  const { editingObject, setObjectValue } = context;

  const values = editingObject[grenseType] ?? {};
  const setObjectValueForType = (grenseId: string, newValues: ObjectValue) =>
    setObjectValue(grenseType, grenseId, newValues);

  return {
    values,
    setObjectValue: setObjectValueForType,
  };
};
