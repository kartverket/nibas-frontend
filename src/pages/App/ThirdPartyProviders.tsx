import { SWRConfig } from "swr";
import { KvibProvider, extendTheme, withDefaultColorScheme, UseToastOptions, defaultKvibTheme } from "@kvib/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { AuthProvider } from "react-oidc-context";
import { getAuthConfigForCurrentEnvironment } from "components/Authentication/AuthenticationConfig";

const emotionCache = createCache({
  key: "emotion-css-cache",
  prepend: true, // ensures styles are prepended to the <head>, instead of appended
});

const swrGlobalConfig = {
  revalidateOnFocus: false,
};

const customTheme = extendTheme(withDefaultColorScheme({ colorScheme: "blue" }), defaultKvibTheme);

const defaultToastOptions: UseToastOptions = {
  position: "top",
  isClosable: true,
  duration: 5000,
  containerStyle: {
    marginTop: "24px",
  },
};

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider {...getAuthConfigForCurrentEnvironment()}>
      <CacheProvider value={emotionCache}>
        <KvibProvider theme={customTheme} toastOptions={{ defaultOptions: defaultToastOptions }}>
          <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
        </KvibProvider>
      </CacheProvider>
    </AuthProvider>
  );
};

export default ThirdPartyProviders;
