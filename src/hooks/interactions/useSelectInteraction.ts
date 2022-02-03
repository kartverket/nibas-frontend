import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Select } from "ol/interaction";
import { map } from "components/Kart/constants";

const useSelectInteraction = () => {
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

  useEffect(() => {
    const select = new Select({ hitTolerance: 5 });

    select.on("select", () => {
      setFeatures(select.getFeatures().getArray().slice());
    });

    map.addInteraction(select);

    return () => {
      map.removeInteraction(select);
    };
  }, []);

  return features;
};

export default useSelectInteraction;
