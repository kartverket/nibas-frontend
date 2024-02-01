import { useContext, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { EditGrenserContext, useEditGrenser } from "./EditGrenserContext";
import { EditingType, KretsStatus } from "./types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { getFeatureId, removeFeaturesFromSourceByIds } from "utils/map/source";
import { getZoomMode } from "utils/map";

export const useEditGrenseValue = (kretsType: EditingType, kretsId: string) => {
  const context = useContext(EditGrenserContext);

  if (!context) {
    throw new Error("useIsEditingGrense must be used within a EditGrenserProvider");
  }

  const kretsStatus = context.alleKretserStatuser[kretsType]?.[kretsId] ?? {};

  const setKretsStatus = (newStatus: KretsStatus) => {
    context.setKretsStatus(kretsType, kretsId, newStatus);
  };

  return { kretsStatus, setKretsStatus };
};

export const useEditGrense = (kretsType: EditingType, kretsId: string, features: Feature<Geometry>[] | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(EditGrenserContext);

  const { resetAndClearAllLayers } = useEditGrenser(kretsType);
  const { kretsStatus, setKretsStatus } = useEditGrenseValue(kretsType, kretsId);
  const { addFeaturesToLayer } = useAsyncFeatures(
    features,
    getZoomMode(!!kretsStatus.editing, context?.getCurrentlyEditingType() != null),
    () => setIsLoading(false),
  );

  const toggleVisible = () => {
    setIsLoading(true);
    const newKretsStatus = {
      ...kretsStatus,
      visible: !kretsStatus.visible,
    };

    setKretsStatus(newKretsStatus);

    if (!newKretsStatus.visible) {
      if (!features) return;

      if (newKretsStatus?.editing) {
        removeFeaturesFromSourceByIds("edit", features.map(getFeatureId));
      } else {
        removeFeaturesFromSourceByIds(kretsType, features.map(getFeatureId));
      }
      setIsLoading(false);
    } else if (newKretsStatus?.editing) {
      // hvis editing skal features legges tilbake til edit-laget
      addFeaturesToLayer("edit");
    } else {
      addFeaturesToLayer(kretsType);
    }
  };

  const toggleEditing = async () => {
    const newKretsStatus = { ...kretsStatus };

    resetAndClearAllLayers();

    newKretsStatus.editing = !newKretsStatus.editing;

    if (kretsStatus.visible && !kretsStatus.editing) {
      newKretsStatus.visible = true;
    } else if (!kretsStatus.visible && kretsStatus.editing) {
      newKretsStatus.visible = false;
    } else {
      newKretsStatus.visible = !newKretsStatus.visible;
    }

    setKretsStatus(newKretsStatus);

    if (newKretsStatus.visible) {
      // legg til i edit fordi dette er etter checkbox click
      addFeaturesToLayer("edit");

      // hvis var synlig før editing ble true, fjern fra gamle layer
      if (!kretsStatus?.visible || !features) return;

      removeFeaturesFromSourceByIds(kretsType, features.map(getFeatureId));
    } else if (!newKretsStatus.editing) {
      if (!features) return;
      removeFeaturesFromSourceByIds("edit", features.map(getFeatureId));
    }
  };

  return {
    kretsStatus,
    toggleEditing,
    toggleVisible,
    isLoading,
  };
};
