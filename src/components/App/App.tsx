import { ThemeProvider } from "styled-components";
import { defaultTheme } from "style/theme";
import Map from "components/Map";

const App = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Map />
    </ThemeProvider>
  );
};

export default App;
