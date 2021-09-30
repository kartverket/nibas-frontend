import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import OlMap from "ol/Map";
import View from "ol/View";
import MapContext from "./MapContext";
import { MapOptions } from "ol/PluggableMap";

type Props = {
  zoom: number;
  center: number[];
};

const Map: React.FC<Props> = ({ zoom, center, children }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<OlMap | null>(null);

  // on component mount
  useEffect(() => {
    if (!mapRef.current) return;

    const options: MapOptions = {
      view: new View({ zoom, center }),
      layers: [],
      controls: [],
      overlays: [],
      keyboardEventTarget: window.document,
    };

    const mapObject = new OlMap(options);
    mapObject.setTarget(mapRef.current);
    setMap(mapObject);

    return () => mapObject.setTarget(undefined);
  }, [center, zoom]);

  // zoom change handler
  // though we don't change zoom in state, but on map?
  useEffect(() => {
    if (!map) return;

    map.getView().setZoom(zoom);
  }, [map, zoom]);

  // center change handler
  // though we don't change center in state, but on map?
  useEffect(() => {
    if (!map) return;

    map.getView().setCenter(center);
  }, [center, map]);

  return (
    <MapContext.Provider value={map}>
      <MapTarget ref={mapRef}>{children}</MapTarget>
    </MapContext.Provider>
  );
};

const MapTarget = styled.div`
  width: 100vw;
  height: 100vh;

  .ol-control {
    text-align: center;
  }
`;

export default Map;
