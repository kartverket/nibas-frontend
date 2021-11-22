import { useState } from "react";

export type EditingType = "fylke" | "kommune";

export type ObjectValue = { selected?: boolean; visible?: boolean };
type EditingObject = Partial<Record<EditingType, Record<string, ObjectValue>>>;

const useEditGrenser = () => {
  const [mode, setMode] = useState<EditingType | null>();
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
    mode,
    setMode,
    editingObject,
    setObjectValue,
  };
};

export default useEditGrenser;
