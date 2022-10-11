import { layerIdByGrenseType } from "components/GrenserDrillDown/ToggleableGrense/ToggleableGrense";
import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { FeatureProperties } from "types/api";
import { getLayerById, removeAllFeatures } from "utils/map/layers";
import {
  mapFeatureToFeatureId,
  removeFeaturesFromSourceByIds,
} from "utils/map/source";
import {
  EditingObject,
  EditingType,
  GrenseDictionary,
  ObjectValue,
} from "./types";
import { getFeaturesIdsByInndelingerKontekst } from "./utils";

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
    setEditingObject((prevEditingObject) => {
      const editFeatureIdsToRemove: string[] = [];

      Object.keys(prevEditingObject).forEach((et) => {
        const featureIdsToRemove: string[] = [];
        const editingType = et as EditingType;

        const grenseDictionary = prevEditingObject[editingType] ?? {};

        Object.keys(grenseDictionary).forEach((id) => {
          const value = grenseDictionary[id];
          const layerId = layerIdByGrenseType[editingType];

          if (value.editing) {
            const featureIdsForEntity = getFeaturesIdsByInndelingerKontekst(
              "edit",
              editingType,
              id
            );
            editFeatureIdsToRemove.push(...featureIdsForEntity);
          } else if (value.visible) {
            const featureIdsForEntity = getFeaturesIdsByInndelingerKontekst(
              layerId,
              editingType,
              id
            );
            featureIdsToRemove.push(...featureIdsForEntity);
          }
        });

        console.log(
          `Removing features from ${editingType}`,
          featureIdsToRemove
        );
        removeFeaturesFromSourceByIds(
          layerIdByGrenseType[editingType],
          featureIdsToRemove
        );
      });

      console.log(`Removing features from edit`, editFeatureIdsToRemove);
      removeFeaturesFromSourceByIds("edit", editFeatureIdsToRemove);

      return {};
    });
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

  const { editingObject, setObjectValue, setEditingObject } = context;

  const values = editingObject[grenseType] ?? {};
  const setObjectValueForType = (grenseId: string, newValues: ObjectValue) =>
    setObjectValue(grenseType, grenseId, newValues);
  const setMultipleValues = (newDictionary: GrenseDictionary) => {
    setEditingObject({
      ...editingObject,
      [grenseType]: newDictionary,
    });
  };

  return {
    values,
    setObjectValue: setObjectValueForType,
    setMultipleValues,
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
