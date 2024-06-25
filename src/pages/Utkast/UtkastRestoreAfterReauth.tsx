import { useOutlet } from "react-router-dom";
import { useEffect } from "react";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

export const UtkastRestoreAfterReauth = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeId } = useInndelinger();
  const { user } = useAuthentication();

  useEffect(() => {
    const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
    if (selectedInndelingerFromSessionStorage != null) {
      selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
      setSelectedFylkeId(selectedInndelingerFromSessionStorage.selectedFylkeId);
      if (user?.state != null && user.state instanceof Object && "utkastId" in user.state) {
        user.state.utkastId = undefined;
      }
    }
  }, [selectInndelinger, setSelectedFylkeId, user]);

  return outlet;
};
