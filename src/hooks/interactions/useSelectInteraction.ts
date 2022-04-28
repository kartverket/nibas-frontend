import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import { Select } from "ol/interaction";
import { map } from "components/Kart/constants";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const useSelectInteraction = () => {
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const { openPanel, closePanel } = useMetadataPanel();

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

  useEffect(() => {
    if (features.length === 1) {
      openPanel("grensemetadata", features[0]);
    } else {
      closePanel();
    }
  }, [features, openPanel, closePanel]);

  return features;
};

export default useSelectInteraction;
