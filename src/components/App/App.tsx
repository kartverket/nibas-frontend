import { ThemeProvider } from "styled-components";
import { defaultTheme } from "style/theme";
import Map from "components/Map";
import { MapProvider } from "components/Map/MapContext";

const App = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <MapProvider>
        <Map />
      </MapProvider>
    </ThemeProvider>
  );
};

export default App;
