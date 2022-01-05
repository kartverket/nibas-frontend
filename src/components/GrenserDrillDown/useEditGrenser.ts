import { useEffect, useState } from "react";
import { getLayerById } from "utils/map/layers";

export type EditingType = "fylke" | "kommune";

export type ObjectValue = { editing?: boolean; visible?: boolean };
type GrenseDictionary = Record<string, ObjectValue>;
type EditingObject = Partial<Record<EditingType, GrenseDictionary>>;

const useEditGrenser = () => {
  // siden vi må vite hvilket endepunkt vi skal bruke for å oppdatere grenser
  // må vi vite hvilken type grenser det blir aktivt jobbet med
  const [mode, setMode] = useState<EditingType | null>(null);
  const [editingObject, setEditingObject] = useState<EditingObject>({});

  useEffect(() => {
    try {
      const editLayer = getLayerById("edit");

      if (mode) {
        editLayer.set("type", mode);
      } else {
        editLayer.unset("type");
      }
    } catch (err) {
      // Denne skal ikke tryne i appen, men noen tester prøver å hente
      // laget uten at de er lagt inn i OpenLayers
    }
  }, [mode]);

  useEffect(() => {
    if (!mode) return;

    // sjekk dypt i treet om det er en value som er selected
    const hasSelected = Object.keys(editingObject).some((editingType) => {
      const children = editingObject[editingType as EditingType];

      if (!children) return false;

      const atLeastOneChildSelected = Object.keys(children).some(
        (child) => children[child].editing
      );

      return atLeastOneChildSelected;
    });

    // hvis selected, sett mode, hvis ikke, set mode til null
    setMode(hasSelected ? mode : null);
  }, [editingObject, mode]);

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

  const getCanSelect = (type: EditingType) => !mode || type === mode;

  return {
    mode,
    getCanSelect,
    editingObject,
    setObjectValue,
  };
};

export default useEditGrenser;
