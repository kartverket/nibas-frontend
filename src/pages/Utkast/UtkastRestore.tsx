import { fetchInndelingFromSessionStorage, sessionStorageKeys } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useAutoSelectInndelingFromUtkast } from "hooks/useAutoSelectInndelingFromUtkast";
import { useEffect } from "react";
import { useOutlet } from "react-router-dom";

export const UtkastRestore = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeIds } = useInndelinger();
  useAutoSelectInndelingFromUtkast(sessionStorage.getItem(sessionStorageKeys.inndeling) == null);

  useEffect(() => {
    const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
    if (selectedInndelingerFromSessionStorage != null) {
      selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
      setSelectedFylkeIds(selectedInndelingerFromSessionStorage.selectedFylkeIds);
    }
  }, [selectInndelinger, setSelectedFylkeIds]);

  return outlet;
};
