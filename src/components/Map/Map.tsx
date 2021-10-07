// import MultiPolygon from "ol/geom/MultiPolygon";
// import { toLonLat } from "ol/proj";
import styled from "styled-components";
import useInteractions from "hooks/interactions/useInteractions";
import useLayers from "hooks/layers/useLayers";
import useDefaultControls from "hooks/useDefaultControls";
import CustomControl from "components/CustomControl";
// import { vectorSource } from "sources";
import { useMap } from "./MapContext";
import { useVisibleLayers } from "hooks/layers/VisibleLayersContext";

const Map = () => {
  const { mapRef } = useMap();
  const { toggleLayerVisibility } = useVisibleLayers();

  useLayers();
  useInteractions();
  useDefaultControls();

  const downloadData = () => {
    // const features = vectorSource.getFeatures();
    // console.log("Features", features);
    // const feature = features[0];
    // console.log("Feature", feature);
    // const idk = feature.getGeometry() as MultiPolygon;
    // const coords = idk.getCoordinates();
    // console.log("Polygons?", idk);
    // console.log("aaa?", coords);
    // const lonLatCoords = coords[0][0].map((coord) => toLonLat(coord));
    // console.log("transformed?", lonLatCoords);
  };

  const toggleVectorLayer = () => {
    toggleLayerVisibility("vector");
  };

  return (
    <MapTarget ref={mapRef}>
      <CustomControl>
        <button onClick={downloadData}>N</button>
      </CustomControl>
      <CustomControl>
        <button onClick={toggleVectorLayer}>Toggle vector</button>
      </CustomControl>
    </MapTarget>
  );
};

const MapTarget = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  .ol-control {
    text-align: center;
  }
`;

export default Map;
