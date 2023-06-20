import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";
import { KvibProvider, theme } from "@kvib/react";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";

const swrGlobalConfig = {
  revalidateOnFocus: false,
};

const customTheme = extendTheme(
  withDefaultColorScheme({ colorScheme: "blue" }),
  theme
);

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <KvibProvider theme={customTheme}>
        <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
      </KvibProvider>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
