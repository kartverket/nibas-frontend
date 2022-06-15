import { useContext } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { EditGrenserContext } from "./EditGrenserContext";
import { EditingType } from "./types";
import { layerIdByGrenseType } from "components/GrenserDrillDown/ToggleableGrense/ToggleableGrense";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { removeFeaturesFromSourceByIds } from "utils/map/source";

export const useEditGrense = (
  grenseType: EditingType,
  grenseId: string,
  features: Feature<Geometry>[] | null
) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error("useEditGrense must be used within a EditGrenserProvider");
  }

  const { editingObject, setObjectValue } = context;
  const value = editingObject[grenseType]?.[grenseId] ?? {};
  const setLayerToAddTo = useAsyncFeatures(features);

  const toggleVisible = () => {
    const newObjectValue = {
      ...value,
      visible: !value.visible,
    };

    setObjectValue(grenseType, grenseId, newObjectValue);

    const layerId = layerIdByGrenseType[grenseType];

    if (!newObjectValue.visible) {
      if (!features) return;

      if (newObjectValue?.editing) {
        removeFeaturesFromSourceByIds("edit", features);
      } else {
        removeFeaturesFromSourceByIds(layerId, features);
      }
    } else if (newObjectValue?.editing) {
      // hvis editing skal features legges tilbake til edit-laget
      setLayerToAddTo("edit");
    } else {
      setLayerToAddTo(layerId);
    }
  };

  const toggleEditing = async () => {
    const newObjectValue = { ...value };

    newObjectValue.editing = !newObjectValue.editing;

    if (value.visible && !value.editing) {
      newObjectValue.visible = true;
    } else if (!value.visible && value.editing) {
      newObjectValue.visible = false;
    } else {
      newObjectValue.visible = !newObjectValue.visible;
    }

    setObjectValue(grenseType, grenseId, newObjectValue);

    if (newObjectValue.visible) {
      // legg til i edit fordi dette er etter checkbox click
      setLayerToAddTo("edit");

      // hvis var synlig før editing ble true, fjern fra gamle layer
      if (!value?.visible || !features) return;

      const layerId = layerIdByGrenseType[grenseType];
      removeFeaturesFromSourceByIds(layerId, features);
    } else if (!newObjectValue.editing) {
      if (!features) return;

      removeFeaturesFromSourceByIds("edit", features);
    }
  };

  return {
    value,
    toggleEditing,
    toggleVisible,
  };
};
