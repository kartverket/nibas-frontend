import { FC } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "styled-components";
import { EditGrenserProvider } from "components/GrenserDrillDown/EditGrenserContext";
import { MetadataPanelProvider } from "contexts/MetadataPanelContext";
import { SidebarPanelProvider } from "contexts/SidebarPanelContext";
import { defaultTheme } from "style/theme";

const Providers: FC = ({ children }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider theme={defaultTheme}>
        <SidebarPanelProvider>
          <MetadataPanelProvider>
            <EditGrenserProvider>{children}</EditGrenserProvider>
          </MetadataPanelProvider>
        </SidebarPanelProvider>
      </ThemeProvider>
    </DndProvider>
  );
};

export default Providers;
