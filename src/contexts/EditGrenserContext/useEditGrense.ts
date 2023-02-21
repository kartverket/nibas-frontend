import { useContext } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { EditGrenserContext, useEditGrenser } from "./EditGrenserContext";
import { EditingType, ObjectValue } from "./types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { getFeatureId, removeFeaturesFromSourceByIds } from "utils/map/source";
import { GrenseId } from "hooks/layers/types";
import { removeAllFeatures } from "utils/map/layers";

const layerIdByGrenseType: Record<EditingType, GrenseId> = {
  fylke: "fylke",
  kommune: "kommune",
  nasjon: "nasjon",
  grunnkrets: "grunnkrets",
  stemmekrets: "stemmekrets",
};

export const useEditGrenseValue = (
  grenseType: EditingType,
  grenseId: string
) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error(
      "useIsEditingGrense must be used within a EditGrenserProvider"
    );
  }

  const value = context.editingObject[grenseType]?.[grenseId] ?? {};

  const setValue = (newValue: ObjectValue) => {
    context.setObjectValue(grenseType, grenseId, newValue);
  };

  return { value, setValue };
};

export const useEditGrense = (
  grenseType: EditingType,
  grenseId: string,
  features: Feature<Geometry>[] | null
) => {
  const { resetEditingObject } = useEditGrenser(grenseType);
  const { value, setValue } = useEditGrenseValue(grenseType, grenseId);
  const { addFeaturesToLayer } = useAsyncFeatures(features, !!value?.editing);

  const toggleVisible = () => {
    const newObjectValue = {
      ...value,
      visible: !value.visible,
    };

    setValue(newObjectValue);

    const layerId = layerIdByGrenseType[grenseType];

    if (!newObjectValue.visible) {
      if (!features) return;

      if (newObjectValue?.editing) {
        removeFeaturesFromSourceByIds("edit", features.map(getFeatureId));
      } else {
        removeFeaturesFromSourceByIds(layerId, features.map(getFeatureId));
      }
    } else if (newObjectValue?.editing) {
      // hvis editing skal features legges tilbake til edit-laget
      addFeaturesToLayer("edit");
    } else {
      addFeaturesToLayer(layerId);
    }
  };

  const toggleEditing = async () => {
    const newObjectValue = { ...value };

    removeAllFeatures();
    resetEditingObject();

    newObjectValue.editing = !newObjectValue.editing;

    if (value.visible && !value.editing) {
      newObjectValue.visible = true;
    } else if (!value.visible && value.editing) {
      newObjectValue.visible = false;
    } else {
      newObjectValue.visible = !newObjectValue.visible;
    }

    setValue(newObjectValue);

    if (newObjectValue.visible) {
      // legg til i edit fordi dette er etter checkbox click
      addFeaturesToLayer("edit");

      // hvis var synlig før editing ble true, fjern fra gamle layer
      if (!value?.visible || !features) return;
      const layerId = layerIdByGrenseType[grenseType];
      removeFeaturesFromSourceByIds(layerId, features.map(getFeatureId));
    } else if (!newObjectValue.editing) {
      if (!features) return;
      removeFeaturesFromSourceByIds("edit", features.map(getFeatureId));
    }
  };

  return {
    value,
    toggleEditing,
    toggleVisible,
  };
};
