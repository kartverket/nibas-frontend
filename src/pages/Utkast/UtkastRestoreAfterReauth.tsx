import { useOutlet } from "react-router-dom";
import { useEffect } from "react";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useAuthentication } from "components/Authentication/useAuthentication";
import { useAutoSelectKommuneFromUtkast } from "../../hooks/useAutoSelectKommuneFromUtkast";

export const UtkastRestoreAfterReauth = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeIds } = useInndelinger();
  const { user } = useAuthentication();

  useAutoSelectKommuneFromUtkast();

  useEffect(() => {
    const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
    if (selectedInndelingerFromSessionStorage != null) {
      selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
      setSelectedFylkeIds(selectedInndelingerFromSessionStorage.selectedFylkeIds);
    }
  }, [selectInndelinger, setSelectedFylkeIds, user]);

  return outlet;
};
