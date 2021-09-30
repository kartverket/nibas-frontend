import { useContext, useEffect } from "react";
import { defaults } from "ol/control";
import MapContext from "../Map/MapContext";

const useDefaultControls = () => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map) return;

    defaults().forEach((control) => map.addControl(control));

    return () => {
      defaults().forEach((control) => map.removeControl(control));
    };
  }, [map]);
};

export default useDefaultControls;
