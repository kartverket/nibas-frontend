import { FC } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "style/theme";

const Providers: FC = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>
    </DndProvider>
  );
};

export default Providers;
