import { useEffect, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { Select } from "ol/interaction";
import { map, overlayPopup } from "components/Kart/constants";
import { useMetadataPanel } from "contexts/MetadataPanelContext";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

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
      const selectedFeature = features[0] as Feature<LineString>;

      if (selectedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
        closePanel();
        overlayPopup.setPosition(getOverlayPosition(selectedFeature));
      } else {
        overlayPopup.setPosition(undefined);
        openPanel({ content: "grensemetadata", data: selectedFeature });
      }
    } else {
      closePanel();
      overlayPopup.setPosition(undefined);
    }
  }, [features, openPanel, closePanel]);

  return features;
};

export default useSelectInteraction;
