import { useEffect } from "react";
import { defaults } from "ol/control";
import { map } from "components/Map/constants";

const useDefaultControls = () => {
  useEffect(() => {
    const defaultControls = defaults();

    defaultControls.forEach((control) => map.addControl(control));

    return () => {
      defaultControls.forEach((control) => map.removeControl(control));
    };
  }, []);
};

export default useDefaultControls;
