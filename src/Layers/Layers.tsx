// import { useContext, useEffect, useState } from "react";
import { useTileLayer, useVectorLayer } from "./useLayer";
import {
  useDrawInteraction,
  useModifyInteraction,
} from "../Interactions/useInteraction";
import { tileSource, vectorSource } from "../Sources/sources";
// import MapContext from "../Map/MapContext";

// move somewhere it makes sense
// const useZoom = () => {
//   const [zoom, setZoom] = useState(2);
//   const map = useContext(MapContext);

//   useEffect(() => {
//     if (!map) return;

//     const updateZoom = () => {
//       const newZoom = map.getView().getZoom();

//       setZoom(newZoom ?? 0);
//     };

//     map.on("moveend", updateZoom);

//     return () => {
//       map.un("moveend", updateZoom);
//     };
//   }, [map]);

//   return zoom;
// };

const Layers = () => {
  // const zoom = useZoom();
  // console.log("Zoom", zoom);
  useTileLayer(tileSource);

  /*const vectorLayer = */ useVectorLayer(vectorSource);
  // console.log(
  //   "Vector layer",
  //   vectorLayer.getSource().getFeatures()[0].getGeometry()
  // );
  useModifyInteraction(vectorSource);
  useDrawInteraction(vectorSource);

  // content is being rendered from the hook which inserts into the map
  return null;
};

export default Layers;
