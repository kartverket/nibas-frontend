import { useEffect, useState } from "react";
import { useMap } from "../components/Map/MapContext";

const setViewSubValue = <T extends unknown>(
  viewValue: T | undefined,
  setState: (newState: T) => void
) => {
  if (!viewValue) return;

  setState(viewValue);
};

const useView = () => {
  const [zoom, setZoom] = useState(0);
  const [center, setCenter] = useState<number[]>([]);
  const [resolution, setResolution] = useState(0);

  const { map } = useMap();

  useEffect(() => {
    if (!map) return;

    const updateView = () => {
      const view = map.getView();

      setViewSubValue(view.getZoom(), setZoom);
      setViewSubValue(view.getCenter(), setCenter);
      setViewSubValue(view.getResolution(), setResolution);
    };

    // når map er initialisert vil view settes til riktig view fra map
    updateView();

    map.on("moveend", updateView);

    return () => {
      map.un("moveend", updateView);
    };
  }, [map]);

  return {
    zoom,
    center,
    resolution,
  };
};

export default useView;
