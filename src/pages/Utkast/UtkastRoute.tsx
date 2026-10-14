import { useAutoSelectInndelingFromUtkast } from "hooks/useAutoSelectInndelingFromUtkast";
import { useOutlet } from "react-router-dom";

export const UtkastRoute = () => {
  const outlet = useOutlet();
  useAutoSelectInndelingFromUtkast();

  return outlet;
};