import { SWRConfig } from "swr";
import { KvibProvider, Toaster } from "@kvib/react";
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

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider {...getAuthConfigForCurrentEnvironment()}>
      <CacheProvider value={emotionCache}>
        <KvibProvider>
          <Toaster />
          <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
        </KvibProvider>
      </CacheProvider>
    </AuthProvider>
  );
};

export default ThirdPartyProviders;
