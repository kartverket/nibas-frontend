import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SWRConfig } from "swr";
import {
  KvibProvider,
  theme,
  extendTheme,
  withDefaultColorScheme,
  UseToastOptions,
} from "@kvib/react";
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

const defaultToastOptions: UseToastOptions = {
  position: "top",
  isClosable: true,
  duration: 7500,
  containerStyle: {
    marginTop: "24px",
  },
};

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CacheProvider value={emotionCache}>
        <KvibProvider
          theme={customTheme}
          toastOptions={{ defaultOptions: defaultToastOptions }}
        >
          <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
        </KvibProvider>
      </CacheProvider>
    </DndProvider>
  );
};

export default ThirdPartyProviders;
