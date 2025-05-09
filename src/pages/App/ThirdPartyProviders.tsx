import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { KvibProvider, UseToastOptions, defaultKvibTheme, extendTheme, withDefaultColorScheme } from "@kvib/react";
import { useAuthenticationConfig } from "components/Authentication/useAuthenticationConfig";
import { AuthProvider } from "react-oidc-context";
import { SWRConfig } from "swr";

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
  const authConfig = useAuthenticationConfig();
  return (
    authConfig != null && (
      <AuthProvider {...authConfig}>
        <CacheProvider value={emotionCache}>
          <KvibProvider theme={customTheme} toastOptions={{ defaultOptions: defaultToastOptions }}>
            <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
          </KvibProvider>
        </CacheProvider>
      </AuthProvider>
    )
  );
};

export default ThirdPartyProviders;
