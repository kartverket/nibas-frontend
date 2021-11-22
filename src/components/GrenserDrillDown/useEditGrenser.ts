import { useEffect, useState } from "react";

export type EditingType = "fylke" | "kommune";

export type ObjectValue = { selected?: boolean; visible?: boolean };
type GrenseDictionary = Record<string, ObjectValue>;
type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;

const useEditGrenser = () => {
  // siden vi må vite hvilket endepunkt vi skal bruke for å oppdatere grenser
  // må vi vite hvilken type grenser det blir aktivt jobbet med
  const [mode, setMode] = useState<EditingType | null>(null);
  const [editingObject, setEditingObject] = useState<EditingObject>({});

  useEffect(() => {
    setMode((prevMode) => {
      if (!prevMode) return prevMode;

      // sjekk dypt i treet om det er en value som er selected
      const hasSelected = Object.keys(editingObject).some((editingType) => {
        const children = editingObject[editingType as EditingType];

        if (!children) return false;

        const atLeastOneChildSelected = Object.keys(children).some(
          (child) => children[child].selected
        );

        return atLeastOneChildSelected;
      });

      return hasSelected ? prevMode : null;
    });
  }, [editingObject]);

  const setObjectValue = (
    type: EditingType,
    name: string,
    values: ObjectValue = {}
  ) => {
    if (!mode) {
      setMode(type);
    }

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
    editingObject,
    setObjectValue,
  };
};

export default useEditGrenser;
