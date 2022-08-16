import { FC } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "styled-components";
import { SWRConfig } from "swr";
import { defaultTheme } from "style/theme";

const ThirdPartyProviders: FC = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={defaultTheme}>
        <SWRConfig>{children}</SWRConfig>
      </ThemeProvider>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
