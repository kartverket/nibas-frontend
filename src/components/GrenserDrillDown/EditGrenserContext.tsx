import React, { createContext, useContext, useState } from "react";

export type EditingType = "fylke" | "kommune" | "nasjon";
export type ObjectValue = {
  editing?: boolean;
  visible?: boolean;
};

type GrenseDictionary = Record<string, ObjectValue>;
type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;

export type EditGrenserContextValue = {
  editingObject: EditingObject;
  setObjectValue: (
    type: EditingType,
    name: string,
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
    name: string,
    values: ObjectValue = {}
  ) => {
    setEditingObject({
      ...editingObject,
      [type]: {
        ...editingObject[type],
        [name]: values,
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
  const setObjectValueForType = (name: string, newValues: ObjectValue) =>
    setObjectValue(grenseType, name, newValues);

  return {
    values,
    setObjectValue: setObjectValueForType,
  };
};
