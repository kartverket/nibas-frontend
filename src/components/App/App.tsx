import { ThemeProvider } from "styled-components";
import { defaultTheme } from "style/theme";
import Map from "components/Map";
import { MapProvider } from "components/Map/MapContext";
import { VisibleLayersProvider } from "hooks/layers/VisibleLayersContext";

const App = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <MapProvider>
        <VisibleLayersProvider>
          <Map />
        </VisibleLayersProvider>
      </MapProvider>
    </ThemeProvider>
  );
};

export default App;
