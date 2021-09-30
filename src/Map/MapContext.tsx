import { createContext } from "react";
// import React, { createContext, useContext, useState } from "react";
import Map from "ol/Map";

// https://kentcdodds.com/blog/how-to-use-react-context-effectively

// const MapContext = createContext<
//   | {
//       map: Map | undefined;
//       setMap: (newMap: Map) => void;
//     }
//   | undefined
// >(undefined);

// const MapProvider: React.FC = ({ children }) => {
//   const [map, setMap] = useState<Map | undefined>();

//   const value = { map, setMap };

//   return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
// };

// const useMap = () => {
//   const context = useContext(MapContext);

//   if (!context) {
//     throw new Error("useMap must be used within a MapProvider");
//   }

//   return context;
// };

// export { MapContext, MapProvider, useMap };

const MapContext = createContext<Map | null>(null);
export default MapContext;
