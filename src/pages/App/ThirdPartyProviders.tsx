import { SWRConfig } from "swr";
import { KvibProvider, extendTheme, withDefaultColorScheme, UseToastOptions, defaultKvibTheme } from "@kvib/react";
import { PostHogProvider } from "posthog-js/react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { PostHogConfig } from "posthog-js";
import { getCurrentEnvironment } from "components/FeatureToggle";

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

const env = getCurrentEnvironment();
const inProduction = env === "prod";
const posthogApiKey = "phc_px56rqpRXFBgiaEyDdaDMJUAQiHXhBtpv6hVaQJoCwPm";
const posthogOptions: Partial<PostHogConfig> = {
  api_host: "https://ph.kartverket.no",
  ui_host: "https://eu.i.posthog.com",
  evaluation_contexts: [env],
  capture_exceptions: inProduction,
  capture_performance: inProduction,
};

const ThirdPartyProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <PostHogProvider apiKey={posthogApiKey} options={posthogOptions}>
      <CacheProvider value={emotionCache}>
        <KvibProvider theme={customTheme} toastOptions={{ defaultOptions: defaultToastOptions }}>
          <SWRConfig value={swrGlobalConfig}>{children}</SWRConfig>
        </KvibProvider>
      </CacheProvider>
    </PostHogProvider>
  );
};

export default ThirdPartyProviders;
