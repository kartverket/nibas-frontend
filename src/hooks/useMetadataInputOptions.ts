import useIsMetadataDisabled from "components/Kart/OverlayPanels/useIsMetadataDisabled";
import get from "lodash.get";
import { ChangeEvent } from "react";
import { FeatureProperties } from "types/api";
import useTimer from "./useTimer";

type Options<T> = {
  dirtyFields: T;
  properties: FeatureProperties;
  updateDraftFromFeature: () => void;
};

const useMetadataInputOptions = <T>({
  dirtyFields,
  properties,
  updateDraftFromFeature,
}: Options<T>) => {
  const { startTimer, clearTimer } = useTimer();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    clearTimer();

    const isDirty = get(dirtyFields, e.target.name);
    if (!isDirty) return;

    startTimer(updateDraftFromFeature, 700);
  };

  const disabled = useIsMetadataDisabled(properties);

  return {
    disabled,
    onChange,
  };
};

export default useMetadataInputOptions;
