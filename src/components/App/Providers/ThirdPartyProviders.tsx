import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";
import { KvibProvider, theme } from "@kvib/react";
import { extendTheme, withDefaultColorScheme } from "@chakra-ui/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

const emotionCache = createCache({
  key: "emotion-css-cache",
  prepend: true, // ensures styles are prepended to the <head>, instead of appended
});

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
      <CacheProvider value={emotionCache}>
        <KvibProvider theme={customTheme}>
          <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
        </KvibProvider>
      </CacheProvider>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
