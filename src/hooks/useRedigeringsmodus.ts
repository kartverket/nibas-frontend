import { useHistory } from "contexts/HistoryContext";
import { useUtkast } from "contexts/UtkastContext";

export const useRedigeringsmodus = () => {
  const { history } = useHistory();
  const { utkast, isValidating } = useUtkast();

  const redigeringsmodusAktiv =
    history.entries.length > 0 || utkast?.id != null || isValidating;

  return { redigeringsmodusAktiv };
};
