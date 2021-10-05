import { useEffect } from "react";
import { defaults } from "ol/control";
import { useMap } from "components/Map/MapContext";

const useDefaultControls = () => {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const defaultControls = defaults();

    defaultControls.forEach((control) => map.addControl(control));

    return () => {
      defaultControls.forEach((control) => map.removeControl(control));
    };
  }, [map]);
};

export default useDefaultControls;
