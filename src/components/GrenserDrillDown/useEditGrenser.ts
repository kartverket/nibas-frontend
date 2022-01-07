import { useState } from "react";

export type EditingType = "fylke" | "kommune";

export type ObjectValue = { editing?: boolean; visible?: boolean };
type GrenseDictionary = Record<string, ObjectValue>;
type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;

const useEditGrenser = () => {
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

  return {
    editingObject,
    setObjectValue,
  };
};

export default useEditGrenser;
