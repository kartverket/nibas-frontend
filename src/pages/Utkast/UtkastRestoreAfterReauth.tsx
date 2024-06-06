import { useOutlet } from "react-router-dom";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import { useEffect } from "react";
import { featureEnabled } from "components/FeatureToggle";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";

export const UtkastRestoreAfterReauth = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeId } = useInndelinger();
  const { user } = useAuthentication();

  useEffect(() => {
    if (featureEnabled("SAVE_STATE_ON_REAUTH")) {
      const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
      if (selectedInndelingerFromSessionStorage != null) {
        selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
        setSelectedFylkeId(selectedInndelingerFromSessionStorage.selectedFylkeId);
        if (user?.state != null && user.state instanceof Object && "utkastId" in user.state) {
          user.state.utkastId = undefined;
        }
      }
    }
  }, [selectInndelinger, setSelectedFylkeId, user]);

  return outlet;
};
