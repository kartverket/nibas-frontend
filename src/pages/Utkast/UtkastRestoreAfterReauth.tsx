import { useOutlet } from "react-router-dom";
import { useEffect } from "react";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useAuthentication } from "components/Authentication/AuthenticationHook";

export const UtkastRestoreAfterReauth = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeIds } = useInndelinger();
  const { user } = useAuthentication();

  useEffect(() => {
    const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
    if (selectedInndelingerFromSessionStorage != null) {
      selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
      setSelectedFylkeIds(selectedInndelingerFromSessionStorage.selectedFylkeIds);
      if (user?.state != null && user.state instanceof Object && "utkastId" in user.state) {
        user.state.utkastId = undefined;
      }
    }
  }, [selectInndelinger, setSelectedFylkeIds, user]);

  return outlet;
};
