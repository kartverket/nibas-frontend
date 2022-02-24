import ToggleableGrense from "./ToggleableGrense";
import useApiGrense from "./useApiGrense";
import { EditingType, ObjectValue } from "./useEditGrenser";
import { SimpleGrense } from "types/api";
import { useEffect } from "react";
import { getLayerById } from "utils/map/layers";
import { layerIdByGrenseType } from "./ToggleableGrense/ToggleableGrense";
import { GeometryVectorSource } from "hooks/sources/types";
import { map } from "components/Kart/constants";
import { Modify } from "ol/interaction";
import { ModifyEvent } from "ol/interaction/Modify";
import Geometry from "ol/geom/Geometry";
import { Feature } from "ol";

type Props<T> = {
  grense: T;
  grenseValue: ObjectValue;
  setGrenseValue: (grenseId: string, value: ObjectValue) => void;
  type: EditingType;
  featuresUrl: string;
};

const updateFeaturesWithModifiedFeature = async (
  features: Feature<Geometry>[],
  updatedFeature: Feature<Geometry>
) => {
  return features;
};

const ApiGrense = <T extends SimpleGrense>({
  grense,
  grenseValue,
  setGrenseValue,
  type,
  featuresUrl,
}: Props<T>) => {
  const { features, fetchFeatures, mutate } = useApiGrense(featuresUrl);

  // useEffect(() => {
  //   const modifyInteraction = map
  //     .getInteractions()
  //     .getArray()
  //     .find((interaction) => interaction instanceof Modify);

  //   if (!modifyInteraction) return;

  //   const onModifyEnd = (e: ModifyEvent) => {
  //     console.log(e);
  //     mutate(async (cachedFeatures) => {
  //       if (!cachedFeatures) return cachedFeatures;

  //       return updateFeaturesWithModifiedFeature(cachedFeatures, e.features);
  //     });
  //   };

  //   (modifyInteraction as Modify).on("modifyend", onModifyEnd);

  //   return () => {
  //     (modifyInteraction as Modify).un("modifyend", onModifyEnd);
  //   };
  // }, [mutate, type]);

  const navn = grense.navn.find((navn) => navn.spraak === "nor")?.navn ?? "";

  return (
    <ToggleableGrense
      key={navn}
      grense={grense}
      type={type}
      title={navn}
      objectValue={grenseValue}
      setObjectValue={setGrenseValue}
      features={features}
      fetchFeatures={fetchFeatures}
    />
  );
};

export default ApiGrense;
