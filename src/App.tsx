import { useState } from "react";
import "./App.css";
import Map from "./Map/Map";
import Layers from "./Layers";
import Controls from "./Controls";
import { fromLonLat } from "ol/proj";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./style/theme";

const App = () => {
  const [zoom] = useState(4);
  const [center] = useState<[number, number]>([-94.9065, 38.9884]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <Map zoom={zoom} center={fromLonLat(center)}>
        <Layers />
        <Controls />
      </Map>
    </ThemeProvider>
  );
};

export default App;
