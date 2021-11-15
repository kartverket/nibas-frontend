import { ThemeProvider } from "styled-components";
import PageLayout from "components/PageLayout";
import { defaultTheme } from "style/theme";

const App = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <PageLayout />
    </ThemeProvider>
  );
};

export default App;
