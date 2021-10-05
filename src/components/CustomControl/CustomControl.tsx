import React, { useEffect, useRef } from "react";
import Control from "ol/control/Control";
import { useMap } from "components/Map/MapContext";

const CustomControl: React.FC = ({ children }) => {
  // vi trenger et element å referere til for control
  const element = useRef<HTMLDivElement>(null);
  const { map } = useMap();
  const singleChild = React.Children.only(children);

  useEffect(() => {
    if (!map) return;

    const control = new Control({
      element: element.current ?? undefined,
    });

    // elementet rendres først i DOM, så flyttes det inn i map med addControl
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  if (!singleChild || !React.isValidElement(singleChild)) return null;

  // legg på ref på vår ene child
  return React.cloneElement(singleChild, {
    ref: element,
  });
};

export default CustomControl;
