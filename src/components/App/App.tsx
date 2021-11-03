import { ThemeProvider } from "styled-components";
import { defaultTheme } from "style/theme";
import PageLayout from "components/PageLayout";

const App = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <PageLayout />
    </ThemeProvider>
  );
};

export default App;
