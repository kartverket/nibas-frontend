import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Map from "ol/Map";
import { MapOptions } from "ol/PluggableMap";
import View from "ol/View";
import OlMap from "ol/Map";
import { INITIAL_CENTER, INITIAL_ZOOM } from "./constants";

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

const MapContext = createContext<
  | {
      map: Map | undefined; // kart kan være undefined om det ikke er initialisert
      mapRef: React.RefObject<HTMLDivElement>;
    }
  | undefined // context kan være undefined om ikke i en MapProvider
>(undefined);

export const MapProvider: React.FC = ({ children }) => {
  const [map, setMap] = useState<Map | undefined>();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const options: MapOptions = {
      view: new View({ zoom: INITIAL_ZOOM, center: INITIAL_CENTER }),
      layers: [],
      controls: [],
      overlays: [],
      keyboardEventTarget: window.document,
    };

    const mapObject = new OlMap(options);
    mapObject.setTarget(mapRef.current);
    setMap(mapObject);

    return () => {
      mapObject.setTarget(undefined);
    };
  }, []);

  const value = { map, mapRef };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }

  return context;
};
