import useIsMetadataDisabled from "components/Kart/OverlayPanels/useIsMetadataDisabled";
import { FeatureProperties } from "types/api";
import useTimer from "./useTimer";

type Options = {
  properties: FeatureProperties;
  updateDraftFromFeature: () => void;
};

const useMetadataInputOptions = ({
  properties,
  updateDraftFromFeature,
}: Options) => {
  const { startTimer, clearTimer } = useTimer();

  const onChange = () => {
    clearTimer();

    startTimer(updateDraftFromFeature, 700);
  };

  const disabled = useIsMetadataDisabled(properties);

  return {
    disabled,
    onChange,
  };
};

export default useMetadataInputOptions;
