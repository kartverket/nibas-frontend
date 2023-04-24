import { useEffect, useMemo, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import LineString from "ol/geom/LineString";
import { Select } from "ol/interaction";
import { map, overlayPopup } from "components/Kart/constants";
import { grenseStyles } from "utils/map/layerStyles";
import { pixelTolerance } from "./constants";
import { useToolbar } from "contexts/ToolbarContext";
import { useDataPanel } from "contexts/DataPanelContext";

const getOverlayPosition = (selectedFeature: Feature<LineString>) => {
  const coordinates = selectedFeature.getGeometry()?.getCoordinates() ?? [];

  if (coordinates.length < 2) return;

  const middle = Math.floor((coordinates.length - 1) / 2);

  return coordinates[middle];
};

const useSelectInteraction = () => {
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const { activePointMode } = useToolbar();
  const { setActiveDataPanel, setSelectedMetadata } = useDataPanel();

  const select = useMemo(
    () =>
      new Select({
        hitTolerance: pixelTolerance,
        style: grenseStyles.select,
        filter: (feature) => {
          if (activePointMode === "metadata") {
            return feature.getGeometry() instanceof LineString;
          }
          return false;
        },
      }),
    [activePointMode]
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
        // TODO: legge inn å lukke panel her?
        // closePanel("grensemetadata");
        overlayPopup.setPosition(getOverlayPosition(selectedFeature));
      } else {
        overlayPopup.setPosition(undefined);
        setSelectedMetadata(selectedFeature);
        setActiveDataPanel("metadata");
      }
    } else {
      overlayPopup.setPosition(undefined);
      setActiveDataPanel(null);
    }
  }, [features, setActiveDataPanel, setSelectedMetadata]);

  return { selectedFeatures: features };
};

export default useSelectInteraction;
