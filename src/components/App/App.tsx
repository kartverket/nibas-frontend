import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "styled-components";
import PageLayout from "components/PageLayout";
import { defaultTheme } from "style/theme";

const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={defaultTheme}>
        <PageLayout />
      </ThemeProvider>
    </DndProvider>
  );
};

export default App;
