import { useOutlet } from "react-router-dom";
import { useEffect } from "react";
import { fetchInndelingFromSessionStorage } from "contexts/application-state-utils";
import { useInndelinger } from "contexts/InndelingerContext/InndelingerContext";
import { useAutoSelectKommuneFromUtkast } from "../../hooks/useAutoSelectKommuneFromUtkast";

export const UtkastRestoreAfterReauth = () => {
  const outlet = useOutlet();
  const { selectInndelinger, setSelectedFylkeIds } = useInndelinger();

  useAutoSelectKommuneFromUtkast();

  useEffect(() => {
    const selectedInndelingerFromSessionStorage = fetchInndelingFromSessionStorage();
    if (selectedInndelingerFromSessionStorage != null) {
      selectInndelinger(selectedInndelingerFromSessionStorage.inndelinger);
      setSelectedFylkeIds(selectedInndelingerFromSessionStorage.selectedFylkeIds);
    }
  }, [selectInndelinger, setSelectedFylkeIds]);

  return outlet;
};
