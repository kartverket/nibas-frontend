import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { Select } from "ol/interaction";
import { map, overlayPopup } from "components/Kart/constants";
import { useOverlayPanels } from "contexts/OverlayPanelsContext";
import { selectStyles } from "utils/map/layerStyles";
import { click } from "ol/events/condition";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

const useSelectInteraction = () => {
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const { openPanel, closePanel } = useOverlayPanels();

  const select = useMemo(
    () =>
      new Select({
        hitTolerance: 20,
        style: selectStyles,
        condition: (e) => {
          if (!click(e)) return false;

          const feature = map.getFeaturesAtPixel(e.pixel);

          // skru av Select hvis det er en punkt som klikkes på
          // når dette lages gjelder dette kun representasjonspunkt
          if (
            feature.length === 1 &&
            feature[0].getGeometry()?.getType() === "Point"
          ) {
            return false;
          }
          return true;
        },
      }),
    []
  );

  useEffect(() => {
    map.addInteraction(select);

    return () => {
      map.removeInteraction(select);
    };
  }, [select]);

  useEffect(() => {
    const syncFeatures = () => {
      setFeatures(select.getFeatures().getArray().slice());
    };

    select.on("select", syncFeatures);

    return () => {
      select.un("select", syncFeatures);
    };
  }, [select, features]);

  useEffect(() => {
    if (features.length === 1) {
      const selectedFeature = features[0] as Feature<LineString>;

      if (selectedFeature.getId()?.toString().includes("TEIGGRENSEWFS")) {
        closePanel("grensemetadata");
        overlayPopup.setPosition(getOverlayPosition(selectedFeature));
      } else {
        overlayPopup.setPosition(undefined);
        openPanel({ type: "grensemetadata", feature: selectedFeature });
      }
    } else {
      closePanel("grensemetadata");
      overlayPopup.setPosition(undefined);
    }
  }, [features, openPanel, closePanel]);

  return { selectedFeatures: features };
};

export default useSelectInteraction;
