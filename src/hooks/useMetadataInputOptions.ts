import useIsMetadataDisabled from "components/Kart/OverlayPanels/useIsMetadataDisabled";
import get from "lodash.get";
import { FeatureProperties } from "types/api";

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
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const isDirty = get(dirtyFields, e.target.name);
    if (!isDirty) return;

    updateDraftFromFeature();
  };

  const disabled = useIsMetadataDisabled(properties);

  return {
    disabled,
    onBlur,
  };
};

export default useMetadataInputOptions;
