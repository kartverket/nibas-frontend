import { getCurrentProjection } from "pages/Kart/Kartinformasjon";
import { map } from "pages/Kart/constants";
import { useState, useEffect } from "react";

export const useProjection = () => {
  const [selectedProjection, setProjection] = useState(getCurrentProjection().getCode());

  useEffect(() => {
    const updateCurrentProjection = () => {
      setProjection(getCurrentProjection().getCode());
    };
    map.on("change:view", updateCurrentProjection);
    return () => {
      map.un("change:view", updateCurrentProjection);
    };
  }, []);

  return {
    selectedProjection,
    setProjection,
  };
};
