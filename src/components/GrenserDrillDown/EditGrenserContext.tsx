import React, { createContext, useContext, useState } from "react";

export type EditingType = "fylke" | "kommune";
export type ObjectValue = { editing?: boolean; visible?: boolean };

type GrenseDictionary = Record<string, ObjectValue>;
type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;

const EditGrenserContext = createContext<
  | {
      editingObject: EditingObject;
      setObjectValue: (
        type: EditingType,
        name: string,
        values?: ObjectValue
      ) => void;
    }
  | undefined
>(undefined);

type Props = {
  isOpen: boolean;
};

export const EditGrenserProvider: React.FC<Props> = ({ children, isOpen }) => {
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
      {isOpen ? children : null}
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
  const { editingObject, setObjectValue } = useEditAllGrenser();

  const values = editingObject[grenseType] ?? {};
  const setObjectValueForType = (name: string, newValues: ObjectValue) =>
    setObjectValue(grenseType, name, newValues);

  return {
    values,
    setObjectValue: setObjectValueForType,
  };
};
