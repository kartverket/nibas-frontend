import { useToolbar } from "contexts/ToolbarContext";
import { useUtkast } from "contexts/UtkastContext";

export const useRedigeringsmodus = () => {
  const { history } = useToolbar();
  const { utkast, isValidating } = useUtkast();

  const redigeringsmodusAktiv =
    history.entries.length > 0 || utkast?.id != null || isValidating;

  return { redigeringsmodusAktiv };
};
